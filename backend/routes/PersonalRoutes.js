import express from "express";
import PersonalController from "../controllers/PersonalController.js"
import Functions from "../Functions/Functions.js";

const router = express.Router();


router.post("/user/personal", (req, res) => PersonalController.CriarPersonal(req, res));

export default router;