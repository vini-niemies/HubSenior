import express from "express";
import TreinoController from "../controllers/TreinoController.js";
import Functions from "../Functions/Functions.js";

const router = express.Router();

router.post("/treino", Functions.verificaToken, (req, res) => TreinoController.CriarTreino(req, res));

export default router;