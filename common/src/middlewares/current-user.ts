import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend req.currentUser definition to get payload into it
// Define definition from web token payload
interface UserPayload {
  id: string;
  email: string;
  iat: number;
}

// Update the req object to enrich meaning of current user property
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session || !req.session.jwt) {
    return next();
  }
  try {
    // cast result 'as' userPayload
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;

    req.currentUser = payload;
    return next();
  } catch (err) {
    return next();
  }
};
