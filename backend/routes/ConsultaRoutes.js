import express from "express";
import ConsultaController from "../controllers/ConsultaController.js";
import Functions from "../Functions/Functions.js";

const router = express.Router();

router.get("/consulta", Functions.verificaToken, (req, res) => ConsultaController.VerificarConsultaPorCliente(req, res));
router.post("/consulta", Functions.verificaToken, (req, res) => ConsultaController.CriarConsulta(req, res));

export default router;
