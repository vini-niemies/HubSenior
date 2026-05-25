import express from "express";
import FeedbackController from "../controllers/FeedbackController.js";
import Functions from "../Functions/Functions.js";

const router = express.Router();

router.get("/feedback", Functions.verificaToken, (req, res) => FeedbackController.ListarFeedbacks(req, res));
router.get("/feedback/:id", Functions.verificaToken, (req, res) => FeedbackController.VerFeedback(req, res));
router.post("/feedback", Functions.verificaToken, (req, res) => FeedbackController.CriarFeedback(req, res));
router.put("/feedback/:id", Functions.verificaToken, (req, res) => FeedbackController.AtualizarFeedback(req, res));
router.delete("/feedback/:id", Functions.verificaToken, (req, res) => FeedbackController.DeletarFeedback(req, res));

export default router;