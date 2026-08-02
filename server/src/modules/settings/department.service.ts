import mongoose from 'mongoose';
import { Employee } from '../employees/employee.model.js';
import { Department, type IDepartmentDocument } from './department.model.js';
import type { CreateDepartmentInput, PatchDepartmentInput } from './department.validation.js';

export class DepartmentServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'DepartmentServiceError';
  }
}

export interface DepartmentPublic {
  id: string;
  name: string;
  isArchived: boolean;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

const toDepartmentPublic = async (
  department: IDepartmentDocument,
  tenantId: string
): Promise<DepartmentPublic> => {
  const employeeCount = await Employee.countDocuments({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    department: department.name,
    status: { $ne: 'terminated' },
  });

  return {
    id: department._id.toString(),
    name: department.name,
    isArchived: department.isArchived,
    employeeCount,
    createdAt: department.createdAt.toISOString(),
    updatedAt: department.updatedAt.toISOString(),
  };
};

export const listDepartments = async (
  tenantId: string,
  includeArchived = false
): Promise<DepartmentPublic[]> => {
  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
  };

  if (!includeArchived) {
    filter.isArchived = false;
  }

  const departments = await Department.find(filter).sort({ name: 1 });
  return Promise.all(departments.map((dept) => toDepartmentPublic(dept, tenantId)));
};

export const listActiveDepartmentNames = async (tenantId: string): Promise<string[]> => {
  const departments = await Department.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    isArchived: false,
  })
    .sort({ name: 1 })
    .lean();

  const managedNames = departments.map((dept) => dept.name);

  const legacyNames = await Employee.distinct('department', {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    department: { $exists: true, $nin: [null, ''] },
  });

  const merged = new Set([...managedNames, ...(legacyNames as string[])]);
  return [...merged].sort((a, b) => a.localeCompare(b));
};

export const createDepartment = async (
  tenantId: string,
  input: CreateDepartmentInput,
  userId: string
): Promise<DepartmentPublic> => {
  const name = input.name.trim();

  const existing = await Department.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });

  if (existing) {
    if (existing.isArchived) {
      existing.isArchived = false;
      existing.updatedBy = new mongoose.Types.ObjectId(userId);
      await existing.save();
      return toDepartmentPublic(existing, tenantId);
    }
    throw new DepartmentServiceError('A department with this name already exists', 409);
  }

  const department = await Department.create({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    name,
    isArchived: false,
    createdBy: new mongoose.Types.ObjectId(userId),
    updatedBy: new mongoose.Types.ObjectId(userId),
  });

  return toDepartmentPublic(department, tenantId);
};

export const patchDepartment = async (
  tenantId: string,
  departmentId: string,
  input: PatchDepartmentInput,
  userId: string
): Promise<DepartmentPublic> => {
  const department = await Department.findOne({
    _id: new mongoose.Types.ObjectId(departmentId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!department) {
    throw new DepartmentServiceError('Department not found', 404);
  }

  const oldName = department.name;

  if (input.name !== undefined && input.name.trim() !== department.name) {
    const duplicate = await Department.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      _id: { $ne: department._id },
      name: { $regex: new RegExp(`^${input.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (duplicate) {
      throw new DepartmentServiceError('A department with this name already exists', 409);
    }

    department.name = input.name.trim();

    await Employee.updateMany(
      {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        department: oldName,
      },
      { $set: { department: department.name } }
    );
  }

  if (input.isArchived !== undefined) {
    department.isArchived = input.isArchived;
  }

  department.updatedBy = new mongoose.Types.ObjectId(userId);
  await department.save();

  return toDepartmentPublic(department, tenantId);
};

export const assertActiveDepartmentName = async (
  tenantId: string,
  departmentName: string | undefined
): Promise<void> => {
  if (!departmentName?.trim()) {
    return;
  }

  const managedCount = await Department.countDocuments({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    isArchived: false,
  });

  if (managedCount === 0) {
    return;
  }

  const name = departmentName.trim();
  const department = await Department.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    isArchived: false,
  });

  if (!department) {
    throw new DepartmentServiceError(
      'Department must be selected from the managed departments list',
      400
    );
  }
};
