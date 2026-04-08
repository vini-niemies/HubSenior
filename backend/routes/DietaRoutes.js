import express from "express";
import DietaController from "../controllers/DietaController.js";
import Functions from "../Functions/Functions.js";

const router = express.Router();

router.get("/dieta", Functions.verificaToken, (req, res) => DietaController.VerDietas(req, res));
router.post("/dieta", Functions.verificaToken, (req, res) => DietaController.CriarDieta(req, res));

export default router;
