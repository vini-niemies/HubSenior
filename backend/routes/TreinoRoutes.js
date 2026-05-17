import express from "express";
import TreinoController from "../controllers/TreinoController.js";
import Functions from "../Functions/Functions.js";

const router = express.Router();

router.get("/treino/:id", Functions.verificaToken, (req, res) => TreinoController.VerTreino(req, res));
router.get("/treino", Functions.verificaToken, (req, res) => TreinoController.ListarTreinos(req, res));
router.post("/treino", Functions.verificaToken, (req, res) => TreinoController.CriarTreino(req, res));
router.put("/treino/:id", Functions.verificaToken, (req, res) => TreinoController.AtualizarTreino(req, res));
router.delete("/treino/:id", Functions.verificaToken, (req, res) => TreinoController.DeletarTreino(req, res));

export default router;