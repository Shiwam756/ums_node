import express from "express";
import multer from "multer";
import path, { dirname } from "path";
import { signUpValidation, loginValidation } from "../helpers/validation.js";
import { register, login, getUser } from "../controllers/userController.js";

import { fileURLToPath } from "url";
import isAuthorize from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, res, callback) => {
    callback(null, path.join(__dirname, "../public/images"));
  },
  filename: (req, file, callback) => {
    const name = Date.now() + "-" + file.originalname;
    callback(null, name);
  },
});

const filefilter = (req, file, callback) => {
  file.mimetype == "image/jpeg" || file.mimetype == "image/png"
    ? callback(null, true)
    : callback(null, false);
};

const upload = multer({ storage: storage, fileFilter: filefilter }).single(
  "image"
);

router.post("/register", upload, signUpValidation, register);
router.post("/login", loginValidation, login);

router.get("/get-user", isAuthorize, getUser);

// router.post("/logout", logout);

export default router;
