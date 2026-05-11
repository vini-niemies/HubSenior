import express from "express";
import AuthController from "../controllers/AuthController.js";
import Functions from "../Functions/Functions.js";

const router = express.Router();

router.post("/auth/me", Functions.verificaToken, (req, res) => AuthController.CheckLogin(req, res));
router.post("/auth/login", (req, res) => AuthController.Login(req, res));
router.post("/auth/logout", Functions.verificaToken, (req, res) => AuthController.Logout(req, res));
router.post("/auth/refresh", (req, res) => AuthController.Refresh(req, res));

export default router;