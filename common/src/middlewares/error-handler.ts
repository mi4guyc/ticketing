import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { CustomError } from "../errors/custom-error";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
  console.log(err);
  return res
    .status(400)
    .send({ errors: [{ message: "Something went wrong" }] });
};
