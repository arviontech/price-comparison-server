import { NextFunction, Request, Response } from "express";
import config from "../config";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    stack: config.node_env === "development" ? err.stack : null,
  });
};

export default globalErrorHandler;
