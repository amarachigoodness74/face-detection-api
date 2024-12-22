import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const imageValidation = () => [
  body("email").not().isEmpty().trim().escape(),
  body("image").not().isEmpty().trim().escape(),
];

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  res.status(422).json({
    status: "error",
    errors: errors.array(),
  });
};