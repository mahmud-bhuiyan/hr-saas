import { parse } from "csv-parse/sync";
import mongoose from "mongoose";
import { writeAuditLog, type AuditContext } from "../audit/audit.service.js";
import { syncSeatCount } from "../billing/billing.service.js";
import {
  assertActiveDepartmentName,
  DepartmentServiceError,
} from "../settings/department.service.js";
import { listCountryDialCodes } from "../settings/country-dial-code.service.js";
import { User } from "../admin/user.model.js";
import { Tenant } from "../auth/tenant.model.js";
import { validatePhoneNationalLength } from "../../utils/phone.js";
import { Employee } from "./employee.model.js";
import { EmployeeServiceError } from "./employee.service.js";
import type { EmployeeImportRowInput } from "./employee.validation.js";

const MAX_IMPORT_ROWS = 500;

const REQUIRED_COLUMNS = [
  "firstName",
  "lastName",
  "email",
  "jobTitle",
  "department",
  "startDate",
] as const;

const OPTIONAL_COLUMNS = ["managerEmail", "phone"] as const;

const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

export interface EmployeeImportError {
  row: number;
  field?: string;
  message: string;
}

export interface EmployeeImportValidRow {
  row: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  startDate: string;
  managerEmail?: string;
  phone?: string;
}

export interface EmployeeImportValidateResult {
  valid: EmployeeImportValidRow[];
  errors: EmployeeImportError[];
  totalRows: number;
}

export interface EmployeeImportCommitResult {
  created: number;
  errors: EmployeeImportError[];
}

const normalizeHeader = (header: string): string =>
  header.trim().replace(/^\uFEFF/, "");

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidStartDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const parseCsvRows = (csvContent: string): Record<string, string>[] => {
  const trimmed = csvContent.trim();
  if (!trimmed) {
    throw new EmployeeServiceError("CSV file is empty", 400);
  }

  let records: Record<string, string>[];

  try {
    records = parse(trimmed, {
      columns: (headers: string[]) => headers.map(normalizeHeader),
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as Record<string, string>[];
  } catch {
    throw new EmployeeServiceError("Unable to parse CSV file", 400);
  }

  if (records.length === 0) {
    throw new EmployeeServiceError("CSV file contains no data rows", 400);
  }

  if (records.length > MAX_IMPORT_ROWS) {
    throw new EmployeeServiceError(
      `CSV exceeds maximum of ${MAX_IMPORT_ROWS} rows`,
      400,
    );
  }

  const headers = Object.keys(records[0] ?? {});
  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !headers.includes(column),
  );

  if (missingColumns.length > 0) {
    throw new EmployeeServiceError(
      `Missing required columns: ${missingColumns.join(", ")}`,
      400,
    );
  }

  const unknownColumns = headers.filter(
    (header) => !ALL_COLUMNS.includes(header as (typeof ALL_COLUMNS)[number]),
  );

  if (unknownColumns.length > 0) {
    throw new EmployeeServiceError(
      `Unknown columns: ${unknownColumns.join(", ")}. Expected: ${ALL_COLUMNS.join(", ")}`,
      400,
    );
  }

  return records;
};

const validateDepartmentName = async (
  tenantId: string,
  department: string,
): Promise<string | undefined> => {
  try {
    await assertActiveDepartmentName(tenantId, department);
    return undefined;
  } catch (error) {
    if (error instanceof DepartmentServiceError) {
      return error.message;
    }
    throw error;
  }
};

export const validateEmployeeImport = async (
  tenantId: string,
  csvContent: string,
): Promise<EmployeeImportValidateResult> => {
  const records = parseCsvRows(csvContent);
  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

  const existingEmployees = await Employee.find({ tenantId: tenantObjectId })
    .select("email")
    .lean();
  const existingEmails = new Set(
    existingEmployees
      .map((employee) => employee.email?.toLowerCase())
      .filter((email): email is string => Boolean(email)),
  );
  const countryDialCodes = await listCountryDialCodes(false);
  const tenant = await Tenant.findById(tenantId).select("defaultPhoneDialCode");
  const fallbackDialCode = tenant?.defaultPhoneDialCode ?? "1";
  const companyAdminEmails = new Set(
    (
      await User.find({
        tenantId: tenantObjectId,
        role: "company_admin",
      })
        .select("email")
        .lean()
    ).map((user) => user.email.toLowerCase().trim()),
  );

  const csvEmails = new Map<string, number>();
  const valid: EmployeeImportValidRow[] = [];
  const errors: EmployeeImportError[] = [];

  for (let index = 0; index < records.length; index += 1) {
    const rowNumber = index + 2;
    const record = records[index];
    const rowErrors: EmployeeImportError[] = [];

    const firstName = record.firstName?.trim() ?? "";
    const lastName = record.lastName?.trim() ?? "";
    const email = record.email?.trim().toLowerCase() ?? "";
    const jobTitle = record.jobTitle?.trim() ?? "";
    const department = record.department?.trim() ?? "";
    const startDate = record.startDate?.trim() ?? "";
    const managerEmail = record.managerEmail?.trim().toLowerCase() || undefined;
    const phone = record.phone?.trim() || undefined;

    if (!firstName) {
      rowErrors.push({
        row: rowNumber,
        field: "firstName",
        message: "First name is required",
      });
    }

    if (!lastName) {
      rowErrors.push({
        row: rowNumber,
        field: "lastName",
        message: "Last name is required",
      });
    }

    if (!email) {
      rowErrors.push({
        row: rowNumber,
        field: "email",
        message: "Email is required",
      });
    } else if (!isValidEmail(email)) {
      rowErrors.push({
        row: rowNumber,
        field: "email",
        message: "Invalid email address",
      });
    } else if (companyAdminEmails.has(email)) {
      rowErrors.push({
        row: rowNumber,
        field: "email",
        message:
          "This email belongs to the company administrator and cannot be used for an employee record.",
      });
    } else {
      if (existingEmails.has(email)) {
        rowErrors.push({
          row: rowNumber,
          field: "email",
          message: "Email already exists for an employee",
        });
      }

      const firstSeenRow = csvEmails.get(email);
      if (firstSeenRow !== undefined) {
        rowErrors.push({
          row: rowNumber,
          field: "email",
          message: `Duplicate email in CSV (also on row ${firstSeenRow})`,
        });
      } else {
        csvEmails.set(email, rowNumber);
      }
    }

    if (!jobTitle) {
      rowErrors.push({
        row: rowNumber,
        field: "jobTitle",
        message: "Job title is required",
      });
    }

    if (!department) {
      rowErrors.push({
        row: rowNumber,
        field: "department",
        message: "Department is required",
      });
    } else {
      const departmentError = await validateDepartmentName(
        tenantId,
        department,
      );
      if (departmentError) {
        rowErrors.push({
          row: rowNumber,
          field: "department",
          message: departmentError,
        });
      }
    }

    if (!startDate) {
      rowErrors.push({
        row: rowNumber,
        field: "startDate",
        message: "Start date is required",
      });
    } else if (!isValidStartDate(startDate)) {
      rowErrors.push({
        row: rowNumber,
        field: "startDate",
        message: "Start date must be YYYY-MM-DD",
      });
    }

    if (managerEmail && !isValidEmail(managerEmail)) {
      rowErrors.push({
        row: rowNumber,
        field: "managerEmail",
        message: "Invalid manager email address",
      });
    } else if (managerEmail && managerEmail === email) {
      rowErrors.push({
        row: rowNumber,
        field: "managerEmail",
        message: "Employee cannot be their own manager",
      });
    }

    if (phone) {
      const phoneError = validatePhoneNationalLength(
        phone,
        countryDialCodes,
        fallbackDialCode,
      );
      if (phoneError) {
        rowErrors.push({ row: rowNumber, field: "phone", message: phoneError });
      }
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      continue;
    }

    valid.push({
      row: rowNumber,
      firstName,
      lastName,
      email,
      jobTitle,
      department,
      startDate,
      managerEmail,
      phone,
    });
  }

  if (valid.length > 0) {
    const managerEmails = [
      ...new Set(
        valid
          .map((row) => row.managerEmail)
          .filter((email): email is string => Boolean(email)),
      ),
    ];

    if (managerEmails.length > 0) {
      const managersInDb = await Employee.find({
        tenantId: tenantObjectId,
        email: { $in: managerEmails },
        status: { $ne: "terminated" },
      })
        .select("email")
        .lean();

      const managerEmailSet = new Set(
        managersInDb
          .map((manager) => manager.email?.toLowerCase())
          .filter(Boolean),
      );
      const csvEmailSet = new Set(valid.map((row) => row.email));

      for (const row of valid) {
        if (!row.managerEmail) {
          continue;
        }

        if (
          !managerEmailSet.has(row.managerEmail) &&
          !csvEmailSet.has(row.managerEmail)
        ) {
          errors.push({
            row: row.row,
            field: "managerEmail",
            message:
              "Manager email not found among employees or in this import",
          });
        }
      }

      const validWithoutManagerErrors = valid.filter(
        (row) =>
          !row.managerEmail ||
          !errors.some(
            (error) => error.row === row.row && error.field === "managerEmail",
          ),
      );

      return {
        valid: validWithoutManagerErrors,
        errors,
        totalRows: records.length,
      };
    }
  }

  return {
    valid,
    errors,
    totalRows: records.length,
  };
};

const generateEmployeeNumber = async (
  tenantId: string,
  offset: number,
): Promise<string> => {
  const count = await Employee.countDocuments({
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });
  return `EMP-${String(count + 1 + offset).padStart(4, "0")}`;
};

export const commitEmployeeImport = async (
  tenantId: string,
  rows: EmployeeImportRowInput[],
  createdByUserId: string,
  audit?: AuditContext,
): Promise<EmployeeImportCommitResult> => {
  if (rows.length === 0) {
    throw new EmployeeServiceError("No rows to import", 400);
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    throw new EmployeeServiceError(
      `Import exceeds maximum of ${MAX_IMPORT_ROWS} rows`,
      400,
    );
  }

  const csvContent = [
    [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].join(","),
    ...rows.map((row) =>
      [
        row.firstName,
        row.lastName,
        row.email,
        row.jobTitle,
        row.department,
        row.startDate,
        row.managerEmail ?? "",
        row.phone ?? "",
      ]
        .map((value) => `"${value.replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");

  const validation = await validateEmployeeImport(tenantId, csvContent);

  if (validation.errors.length > 0) {
    return {
      created: 0,
      errors: validation.errors,
    };
  }

  if (validation.valid.length !== rows.length) {
    throw new EmployeeServiceError("Import rows failed validation", 400);
  }

  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
  const actorId = new mongoose.Types.ObjectId(createdByUserId);
  const batchId = new mongoose.Types.ObjectId();
  const emailToEmployeeId = new Map<string, string>();

  const existingManagers = await Employee.find({
    tenantId: tenantObjectId,
    status: { $ne: "terminated" },
  })
    .select("_id email")
    .lean();

  for (const manager of existingManagers) {
    if (manager.email) {
      emailToEmployeeId.set(
        manager.email.toLowerCase(),
        manager._id.toString(),
      );
    }
  }

  let created = 0;

  for (let index = 0; index < validation.valid.length; index += 1) {
    const row = validation.valid[index];
    const employeeNumber = await generateEmployeeNumber(tenantId, index);

    const employee = await Employee.create({
      tenantId: tenantObjectId,
      employeeNumber,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      jobTitle: row.jobTitle,
      department: row.department,
      startDate: new Date(row.startDate),
      status: "active",
      createdBy: actorId,
      updatedBy: actorId,
    });

    emailToEmployeeId.set(row.email, employee._id.toString());
    created += 1;
  }

  for (const row of validation.valid) {
    if (!row.managerEmail) {
      continue;
    }

    const employeeId = emailToEmployeeId.get(row.email);
    const managerId = emailToEmployeeId.get(row.managerEmail);

    if (!employeeId || !managerId) {
      continue;
    }

    await Employee.updateOne(
      {
        _id: new mongoose.Types.ObjectId(employeeId),
        tenantId: tenantObjectId,
      },
      { managerId: new mongoose.Types.ObjectId(managerId), updatedBy: actorId },
    );
  }

  void writeAuditLog({
    tenantId,
    userId: createdByUserId,
    action: "create",
    entityType: "Employee",
    entityId: batchId.toString(),
    after: {
      importBatch: true,
      createdCount: created,
      emails: validation.valid.map((row) => row.email),
    },
    context: audit,
  });

  if (created > 0) {
    void syncSeatCount(tenantId);
  }

  return { created, errors: [] };
};
