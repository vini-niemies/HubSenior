import express from "express";
import DietaController from "../controllers/DietaController.js";
import Functions from "../Functions/Functions.js";

const router = express.Router();

router.get("/dieta", Functions.verificaToken, (req, res) => DietaController.ListarDietas(req, res));
router.get("/dieta/:id_dieta", Functions.verificaToken, (req, res) => DietaController.VerDieta(req, res));
router.post("/dieta", Functions.verificaToken, (req, res) => DietaController.CriarDieta(req, res));
router.put("/dieta/:id", Functions.verificaToken, (req, res) => DietaController.AtualizarDieta(req, res));
router.delete("/dieta/:id", Functions.verificaToken, (req, res) => DietaController.ExcluirDieta(req, res));

export default router;
