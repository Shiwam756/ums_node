import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/dbConeection.js";
import bodyParser from "body-parser";
import router from "./routes/userRoute.js";
import user_routes from "./routes/webRoute.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", router);
app.use("/", user_routes);

// app.set("view engine", "ejs");
// app.set("views", "./views");
// app.use(express.static("public"));

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  res.status(err.statusCode).json({
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
