import express from "express";
import { verifyMail } from "../controllers/userController.js";

const user_routes = express.Router();

user_routes.get("/mail-verification", verifyMail);

export default user_routes;
