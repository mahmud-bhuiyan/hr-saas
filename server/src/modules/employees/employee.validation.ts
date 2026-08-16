import { z } from "zod";

const employeeStatusSchema = z.enum(["active", "on_leave", "terminated"]);
const payRateTypeSchema = z.enum(["hourly", "salary"]);

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email")
    .transform((v) => v.toLowerCase().trim()),
  phone: z.string().trim().min(1, "Phone is required").max(16),
  jobTitle: z.string().trim().min(1, "Job title is required").max(100),
  department: z.string().trim().max(100).optional(),
  startDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Start date is required and must be YYYY-MM-DD",
    ),
  managerId: z.string().min(1).optional(),
  employeeNumber: z.string().trim().max(50).optional(),
  status: employeeStatusSchema.optional(),
});

export const updateEmployeeSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Invalid email")
      .transform((v) => v.toLowerCase().trim())
      .optional(),
    phone: z.string().trim().min(1, "Phone is required").max(16).optional(),
    jobTitle: z
      .string()
      .trim()
      .min(1, "Job title is required")
      .max(100)
      .optional(),
    department: z.string().trim().max(100).optional().or(z.literal("")),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD")
      .optional(),
    managerId: z.string().min(1).optional().nullable(),
    status: employeeStatusSchema.optional(),
    payRate: z.number().min(0).optional().nullable(),
    payRateType: payRateTypeSchema.optional().nullable(),
    payCurrency: z.string().trim().length(3).optional().or(z.literal("")),
    fteFactor: z.number().min(0).max(1).optional(),
    defaultLocationId: z.string().min(1).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const employeeSortFieldSchema = z.enum([
  "name",
  "employeeNumber",
  "jobTitle",
  "department",
  "manager",
]);

const sortOrderSchema = z.enum(["asc", "desc"]);

export const listEmployeesQuerySchema = z.object({
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  status: employeeStatusSchema.optional(),
  sortBy: employeeSortFieldSchema.optional(),
  sortOrder: sortOrderSchema.optional(),
});

export const inviteEmployeeSchema = z.object({
  role: z
    .enum(["employee", "manager", "hr_manager"])
    .optional()
    .default("employee"),
});

export const createEmployeeLoginSchema = inviteEmployeeSchema;

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;
export type CreateEmployeeLoginInput = z.infer<
  typeof createEmployeeLoginSchema
>;

export const updateMyEmployeeSchema = z.object({
  phone: z.string().trim().min(1, "Phone is required").max(16),
});

export type UpdateMyEmployeeInput = z.infer<typeof updateMyEmployeeSchema>;

export const employeeImportCsvSchema = z.object({
  csv: z.string().trim().min(1, "CSV content is required"),
});

const employeeImportRowSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase().trim()),
  jobTitle: z.string().trim().min(1).max(100),
  department: z.string().trim().min(1).max(100),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  managerEmail: z
    .string()
    .email()
    .transform((value) => value.toLowerCase().trim())
    .optional(),
  phone: z.string().trim().max(16).optional(),
});

export const employeeImportCommitSchema = z.object({
  rows: z
    .array(employeeImportRowSchema)
    .min(1, "At least one row is required")
    .max(500),
});

export type EmployeeImportCsvInput = z.infer<typeof employeeImportCsvSchema>;
export type EmployeeImportRowInput = z.infer<typeof employeeImportRowSchema>;
export type EmployeeImportCommitInput = z.infer<
  typeof employeeImportCommitSchema
>;
