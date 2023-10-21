import mysql from "mysql";

// const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

const db = mysql.createConnection({
  host: "localhost",
  user: "AddRupee",
  password: "Addrupee@7052",
  database: "ums_node",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database Connected Successfully!");
});

export default db;
