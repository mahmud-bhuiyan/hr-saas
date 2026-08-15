import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import {
  DepartmentServiceError,
  createDepartment,
  deleteDepartment,
  listDepartments,
  patchDepartment,
} from "./department.service.js";
import {
  createDepartmentSchema,
  patchDepartmentSchema,
} from "./department.validation.js";

export const listDepartmentsHandler = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.tenantId) {
      res
        .status(403)
        .json({ status: "error", message: "Tenant context required" });
      return;
    }

    const includeArchived = req.query.includeArchived === "true";
    const departments = await listDepartments(req.tenantId, includeArchived);
    res.json({ status: "ok", data: { departments } });
  } catch (error) {
    if (error instanceof DepartmentServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const createDepartmentHandler = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res
        .status(403)
        .json({ status: "error", message: "Tenant context required" });
      return;
    }

    const parsed = createDepartmentSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid request body",
      });
      return;
    }

    const department = await createDepartment(
      req.tenantId,
      parsed.data,
      req.user.sub,
    );
    res.status(201).json({ status: "ok", data: department });
  } catch (error) {
    if (error instanceof DepartmentServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const patchDepartmentHandler = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res
        .status(403)
        .json({ status: "error", message: "Tenant context required" });
      return;
    }

    const parsed = patchDepartmentSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid request body",
      });
      return;
    }

    const department = await patchDepartment(
      req.tenantId,
      req.params.id,
      parsed.data,
      req.user.sub,
    );
    res.json({ status: "ok", data: department });
  } catch (error) {
    if (error instanceof DepartmentServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const deleteDepartmentHandler = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res
        .status(403)
        .json({ status: "error", message: "Tenant context required" });
      return;
    }

    await deleteDepartment(req.tenantId, req.params.id);
    res.json({ status: "ok", data: { deleted: true } });
  } catch (error) {
    if (error instanceof DepartmentServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
