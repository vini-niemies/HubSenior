import express from "express";
import ClienteController from "../controllers/ClienteController.js";
import Functions from "../Functions/Functions.js";

const router = express.Router();

router.get("/user/cliente", Functions.verificaToken, (req, res) => ClienteController.VerDadosCliente(req, res));
router.post("/user/cliente", (req, res) => ClienteController.CriarCliente(req, res));
router.delete("/user/cliente", Functions.verificaToken, (req, res) => ClienteController.DeletarCliente(req, res));

export default router;