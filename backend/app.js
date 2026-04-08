import express from "express";
import conn from "./config/conn.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import nutriRotas from "./routes/NutricionistaRoutes.js";
import clienteRotas from "./routes/ClienteRoutes.js";
import authRotas from "./routes/AuthRoutes.js";
import dietaRotas from "./routes/DietaRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000']
}));

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.use(nutriRotas);
app.use(clienteRotas);
app.use(authRotas);
app.use(dietaRotas);

conn.connect((error) => {
  if (error) console.log("erro" + error);
  else console.log("banco conectado");
});

app.listen(3000, () => { console.log("server ligado") });