import express from "express";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();

router.post("/auth/login", (req, res) => AuthController.Login(req, res));

export default router;