import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/user";
import { BadRequestError } from "@mi3guyc/common";
import { validateRequest } from "@mi3guyc/common";

import jwt from "jsonwebtoken";
import { Password } from "../services/password";

const router = express.Router();

router.post(
  "/api/users/signin",
  // Validation
  [
    body("email").trim().isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password required"),
  ],
  validateRequest,
  // Perform All Async Activities with Validation
  async (req: Request, res: Response) => {
    // Check database
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Authentication Failed");
    }

    const passwordMatchOK = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordMatchOK) {
      throw new BadRequestError("Authentication Failed");
    }

    // Generate JWT - Synchronously
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    req.session = { jwt: userJwt };

    // Send back token
    return res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
