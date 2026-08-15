import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import {
  LocationServiceError,
  createWorkLocation,
  deleteWorkLocation,
  listWorkLocations,
  patchWorkLocation,
} from "./location.service.js";
import {
  createLocationSchema,
  patchLocationSchema,
} from "./location.validation.js";

export const listLocationsHandler = async (
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
    const locations = await listWorkLocations(req.tenantId, includeArchived);
    res.json({ status: "ok", data: { locations } });
  } catch (error) {
    if (error instanceof LocationServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const createLocationHandler = async (
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

    const parsed = createLocationSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid request body",
      });
      return;
    }

    const location = await createWorkLocation(
      req.tenantId,
      parsed.data,
      req.user.sub,
      {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      },
    );
    res.status(201).json({ status: "ok", data: location });
  } catch (error) {
    if (error instanceof LocationServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const patchLocationHandler = async (
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

    const parsed = patchLocationSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid request body",
      });
      return;
    }

    const location = await patchWorkLocation(
      req.tenantId,
      req.params.id,
      parsed.data,
      req.user.sub,
      {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      },
    );
    res.json({ status: "ok", data: location });
  } catch (error) {
    if (error instanceof LocationServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const deleteLocationHandler = async (
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

    await deleteWorkLocation(req.tenantId, req.params.id, req.user.sub, {
      ip: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
    });
    res.json({ status: "ok", data: { deleted: true } });
  } catch (error) {
    if (error instanceof LocationServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
