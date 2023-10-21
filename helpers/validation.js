import { check } from "express-validator";

export const signUpValidation = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please enter a valid Email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("password", "Password is required").isLength({ min: 6 }),
  check("image")
    .custom((value, { req }) => {
      if (
        req.file.mimetype == "image/jpeg" ||
        req.file.mimetype == "image/png"
      ) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please upload an image type PNG, JPG"),
];
export const loginValidation = [
  check("email", "Please enter a valid Email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("password", "Password minimum 6 length").isLength({ min: 6 }),
];
