import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import Randomstring from "randomstring";
import jwt, { decode } from "jsonwebtoken";
// const { JWT_SECRET } = process.env;
const JWT_SECRET = "strong-secret-key-shivam";

import sendMail from "../helpers/sendMail.js";
import db from "../config/dbConeection.js";
import router from "../routes/userRoute.js";

export const register = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
      req.body.email
    )})`,
    (err, result) => {
      if (result && result.length) {
        return res.status(409).send({
          msg: "This user is already exist!",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(400).send({
              msg: err,
            });
          } else {
            db.query(
              `INSERT INTO users (name, email, password,image) VALUES ('${
                req.body.name
              }', ${db.escape(req.body.email)}, ${db.escape(hash)},'images/${
                req.file.filename
              }')`,
              (err, result) => {
                if (err) {
                  return res.status(400).send({
                    msg: err,
                  });
                }

                const mailSubject = "Mail Verification";
                const randomToken = Randomstring.generate();
                const content = `<p>Hi ${req.body.name}, Please <a href="http://localhost:5000/mail-verification?token=${randomToken}">Verify</a> your Mail.</p>`;

                sendMail(req.body.email, mailSubject, content);

                db.query(
                  "UPDATE users set token=? where email=?",
                  [randomToken, req.body.email],
                  (err, result, fields) => {
                    if (err) {
                      return res.status(400).send({
                        msg: err,
                      });
                    }
                  }
                );
                return res.status(200).send({
                  msg: "The User is registered Successfully!",
                });
              }
            );
          }
        });
      }
    }
  );
};

export const verifyMail = (req, res) => {
  const token = req.query.token;

  // Check if the token is provided
  if (!token) {
    return res.status(400).render("404", { message: "Token is missing." });
  }

  db.query(
    "SELECT * FROM users WHERE token = ? LIMIT 1",
    token,
    (error, result, fields) => {
      if (error) {
        console.log(error.message);
        return res.status(500).send("Internal Server Error");
      }

      if (result.length === 0) {
        return res.status(404).render("404", { message: "Token not found." });
      }

      const userId = result[0].id;

      // Update the user's status as verified
      db.query(
        "UPDATE users SET token = null, is_verified = 1 WHERE id = ?",
        userId,
        (updateError, updateResult, updateFields) => {
          if (updateError) {
            console.log(updateError.message);
            return res.status(500).send("Internal Server Error");
          }

          return res.render("mail-verification", {
            message: "Mail Verified Successfully!",
          });
        }
      );
    }
  );
};

export const login = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  db.query(`SELECT * FROM users WHERE email = ?`, [email], (err, result) => {
    if (err) {
      return res.status(500).send({
        msg: "Database error: " + err,
      });
    }

    if (result.length === 0) {
      return res.status(401).send({
        msg: "Email or Password is incorrect!",
      });
    }

    const user = result[0];

    // Ensure that both data and hash are strings before using bcrypt.compare
    if (typeof password === "string" && typeof user.password === "string") {
      // Compare the provided password with the hashed password from the database
      bcrypt.compare(password, user.password, (bErr, bResult) => {
        if (bErr) {
          return res.status(500).send({
            msg: "Bcrypt error: " + bErr,
          });
        }

        if (bResult) {
          // Generate a JWT token
          const token = jwt.sign(
            {
              id: user.id,
              is_admin: user.is_admin,
            },
            JWT_SECRET,
            { expiresIn: "15d" }
          );

          // Update the last login timestamp in the database
          db.query(
            `UPDATE users SET last_login = NOW() WHERE id = ?`,
            [user.id],
            (updateErr) => {
              if (updateErr) {
                return res.status(500).send({
                  msg: "Update error: " + updateErr,
                });
              }

              return res.status(200).json({
                msg: "Signed In Successfully",
                token,
                user,
              });
            }
          );
        } else {
          return res.status(401).send({
            msg: "Email or Password is incorrect!",
          });
        }
      });
    } else {
      return res.status(400).send({
        msg: "Invalid data provided for bcrypt comparison.",
      });
    }
  });
};

export const getUser = (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1]; // Assuming the token is sent in the "Authorization" header

  // Check if the token is provided
  if (!authToken) {
    return res.status(400).json({ msg: "Token is missing." });
  }

  // Verify and decode the token to get user information
  const decode = jwt.verify(authToken, JWT_SECRET);

  db.query(
    "SELECT * FROM users WHERE id= ?",
    decode.id,
    (error, result, fields) => {
      if (error) {
        return res.status(401).json({ msg: "Invalid token." });
      }
      return res.status(200).send({
        success: true,
        data: result[0],
        message: "Fetched Successfully",
      });
    }
  );
};
