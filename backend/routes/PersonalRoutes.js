import express from "express";
import PersonalController from "../controllers/PersonalController.js"
import Functions from "../Functions/Functions.js";

const router = express.Router();


router.get("/user/personal", Functions.verificaToken, (req, res) => PersonalController.VerDadosPersonal(req, res));
router.get("/user/personal/clientes", Functions.verificaToken, (req, res) => PersonalController.VerClientes(req, res));
router.post("/user/personal", (req, res) => PersonalController.CriarPersonal(req, res));
router.put("/user/personal", Functions.verificaToken, (req, res) => PersonalController.AtualizarPersonal(req, res));
router.delete("/user/personal", Functions.verificaToken, (req, res) => PersonalController.DeletarPersonal(req, res));

export default router;