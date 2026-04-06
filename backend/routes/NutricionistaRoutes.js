import express from "express";
import NutricionistaController from "../controllers/NutricionistaController.js";
import Functions from "../Functions/Functions.js";

const router = express.Router();

router.get("/user/nutricionista", Functions.verificaToken, (req, res) => NutricionistaController.VerDadosNutricionista(req, res));
router.post("/user/nutricionista", (req, res) => NutricionistaController.CriarNutricionista(req, res));
router.delete("/user/nutricionista", Functions.verificaToken, (req, res) => NutricionistaController.DeletarNutricionista(req, res));

export default router;