import { Router, Request, Response } from "express";
import User from "../models/user.model";
import { imageValidation, validate } from "../validations/user.validations";

const router = Router();

router.get("/profile/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Invalid route." });
    }

    // Check if user exists
    const user = await User.findById({ id });
    if (!user) {
      res.status(404).json({ error: "User not found." });
    } else {
      res.status(200).json({ user: user });
    }
  } catch (error: any) {
    res.status(500).json({ error: "error getting user" });
  }
});

router.post("/image", imageValidation(), validate, async (req: Request, res: Response) => {
  try {
    const { id, image } = req.body;

    if (!id) {
      res.status(400).json({ message: "Invalid route." });
    }

    // Check if user exists
    const user = await User.findById({ id });
    if (!user) {
      res.status(404).json({ message: "User not found." });
    } else {
      const usertoUpdate = await User.findByIdAndUpdate(
        { id },
        { image, entries: user.entries + 1 }
      );
      res
        .status(200)
        .json({ message: "Login successful.", user: usertoUpdate });
    }
  } catch (error: any) {
    res.status(500).json({ error: "unable to get entries" });
  }
});

export default router;
