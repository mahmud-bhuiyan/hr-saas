import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import {
  CountryDialCodeServiceError,
  createCountryDialCode,
  deleteCountryDialCode,
  getCountryDialCodesBundle,
  listCountryDialCodes,
  patchCountryDialCode,
} from "./country-dial-code.service.js";
import {
  createCountryDialCodeSchema,
  patchCountryDialCodeSchema,
} from "./country-dial-code.validation.js";

export const listTenantCountryDialCodesHandler = async (
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

    const bundle = await getCountryDialCodesBundle(req.tenantId, req.user?.sub);
    res.json({ status: "ok", data: bundle });
  } catch (error) {
    if (error instanceof CountryDialCodeServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const listManagedCountryDialCodesHandler = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const includeArchived = req.query.includeArchived === "true";
    const countryDialCodes = await listCountryDialCodes(
      includeArchived,
      req.user?.sub,
    );
    res.json({ status: "ok", data: { countryDialCodes } });
  } catch (error) {
    if (error instanceof CountryDialCodeServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const createCountryDialCodeHandler = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(403)
        .json({ status: "error", message: "Authentication required" });
      return;
    }

    const parsed = createCountryDialCodeSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid request body",
      });
      return;
    }

    const countryDialCode = await createCountryDialCode(
      parsed.data,
      req.user.sub,
    );
    res.status(201).json({ status: "ok", data: countryDialCode });
  } catch (error) {
    if (error instanceof CountryDialCodeServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const patchCountryDialCodeHandler = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(403)
        .json({ status: "error", message: "Authentication required" });
      return;
    }

    const parsed = patchCountryDialCodeSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid request body",
      });
      return;
    }

    const countryDialCode = await patchCountryDialCode(
      req.params.id,
      parsed.data,
      req.user.sub,
    );
    res.json({ status: "ok", data: countryDialCode });
  } catch (error) {
    if (error instanceof CountryDialCodeServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const deleteCountryDialCodeHandler = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(403)
        .json({ status: "error", message: "Authentication required" });
      return;
    }

    await deleteCountryDialCode(req.params.id);
    res.json({ status: "ok", data: { deleted: true } });
  } catch (error) {
    if (error instanceof CountryDialCodeServiceError) {
      res
        .status(error.statusCode)
        .json({ status: "error", message: error.message });
      return;
    }
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
