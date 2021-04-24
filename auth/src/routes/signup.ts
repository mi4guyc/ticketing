import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/user";
import { validateRequest } from "@mi3guyc/common";
//import { RequestValidationError } from "../errors/request-validation-error";
import { BadRequestError } from "@mi3guyc/common";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").trim().isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  // Perform All Async Activities with Validation
  async (req: Request, res: Response) => {
    // Check database
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    // Create the User
    const user = User.build({ email, password });
    await user.save();

    // Generate JWT - Synchronously
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    req.session = { jwt: userJwt };

    // Send back token
    return res.status(201).send(user);
  }
);

export { router as signupRouter };
