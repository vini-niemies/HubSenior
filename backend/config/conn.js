import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const conn = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBDATABASE,
});

export default conn;