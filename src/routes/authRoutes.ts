import { Router, Request, Response } from "express";
import User from "../models/user.model";
import { signinValidation, signupValidation, validate } from "../validations/auth.validations";

const router = Router();

// Register a new user
router.post(
  "/signup",
  signupValidation(),
  validate,
  async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "User already exists." });
      }

      const user = new User({ name, email, password });
      await user.save();

      res
        .status(201)
        .json({ message: "User registered successfully.", userId: user._id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Login user
router.post(
  "/signin",
  signinValidation(),
  validate,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required." });
      }

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ message: "User not found." });
      } else {
        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          res.status(401).json({ message: "Invalid credentials." });
        }

        res
          .status(200)
          .json({ message: "Login successful.", userId: user._id });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
