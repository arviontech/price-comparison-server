import e, { Request, Response } from "express";

const notFoundRoutes = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: {
      path: req.originalUrl,
      message: "Your Request path is not found",
    },
  });
};

export default notFoundRoutes;
