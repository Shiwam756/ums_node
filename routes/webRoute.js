import express from "express";
import { verifyMail } from "../controllers/userController.js";

const user_routes = express();

user_routes.set("view engine", "ejs");
user_routes.set("views", "./views");
user_routes.use(express.static("public"));

user_routes.get("/mail-verification", verifyMail);

export default user_routes;
