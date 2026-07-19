import type { Request, Response, NextFunction } from "express";
import { getUsageReport } from "../services/report.service.js";

export const getUsageReportController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const report = await getUsageReport();

    return res.status(200).json({
      success: true,
      message: "Usage report retrieved successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
