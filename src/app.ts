import express, { Application, Request, Response } from "express";
import cors from "cors";
import middlewareRouter from "./app/modules/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFoundRoutes from "./app/middleware/NotFoundRoute";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", middlewareRouter);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Price Comparison Server is running",
  });
});

app.use(globalErrorHandler);

app.use(notFoundRoutes);

export default app;
