import conn from "../config/conn.js";
import Feedback from "../models/Feedback.js";

class FeedbackController {
	async CriarFeedback(req, res) {
		try {
			if (req.user.role !== "cliente") {
				return res.status(403).json({ erro: "Apenas clientes podem cadastrar feedback" });
			}

			const { texto, id_dieta, id_treino } = req.body;
			const id_cliente = req.user.id;

			if (!texto || !String(texto).trim()) {
				return res.status(400).json({ erro: "Texto do feedback é obrigatório" });
			}

			const temDieta = id_dieta !== undefined && id_dieta !== null && id_dieta !== "";
			const temTreino = id_treino !== undefined && id_treino !== null && id_treino !== "";

			if (temDieta === temTreino) {
				return res.status(400).json({ erro: "Informe apenas id_dieta ou id_treino" });
			}

			if (temDieta) {
				const [dietaRows] = await conn.promise().execute(
					"SELECT id_dieta FROM dietas WHERE id_dieta = ? AND id_cliente = ?",
					[id_dieta, id_cliente]
				);

				if (dietaRows.length <= 0) {
					return res.status(404).json({ erro: "Dieta não encontrada para este cliente" });
				}
			}

			if (temTreino) {
				const [treinoRows] = await conn.promise().execute(
					"SELECT id_treino FROM treinos WHERE id_treino = ? AND id_cliente = ?",
					[id_treino, id_cliente]
				);

				if (treinoRows.length <= 0) {
					return res.status(404).json({ erro: "Treino não encontrado para este cliente" });
				}
			}

			const feedback = new Feedback(
				id_cliente,
				temDieta ? id_dieta : null,
				temTreino ? id_treino : null,
				String(texto).trim()
			);

			const [results] = await conn.promise().execute(
				"INSERT INTO feedback (id_cliente, id_dieta, id_treino, texto) VALUES (?, ?, ?, ?)",
				feedback.toArray()
			);

			if (results.affectedRows <= 0) {
				return res.status(500).json({ erro: "Não foi possível cadastrar o feedback" });
			}

			return res.status(201).json({ sucesso: "Feedback cadastrado com sucesso" });
		} catch (error) {
			return res.status(500).json({ erro: error });
		}
	}
	async ListarFeedbacks(req, res) {
		try {

			const id_cliente = req.query?.id_cliente || req.user.id;
			const id_dieta = req.query?.id_dieta || null;
			const id_treino = req.query?.id_treino || null;

			if (!id_cliente) {
				return res.status(400).json({ erro: "id_cliente é obrigatório" });
			}

			if (id_dieta && id_treino) {
				return res.status(400).json({ erro: "Informe apenas id_dieta ou id_treino" });
			}

			let query =
				`SELECT f.id_feedback, f.id_cliente, f.id_dieta, f.id_treino, f.texto,
						d.titulo_dieta, t.nome_treino
				 FROM feedback f
				 LEFT JOIN dietas d ON f.id_dieta = d.id_dieta
				 LEFT JOIN treinos t ON f.id_treino = t.id_treino
				 WHERE f.id_cliente = ?`;

			const params = [id_cliente];

			if (id_dieta) {
				query += " AND f.id_dieta = ?";
				params.push(id_dieta);
			} else if (id_treino) {
				query += " AND f.id_treino = ?";
				params.push(id_treino);
			}

			const [rows] = await conn.promise().execute(
				`${query} ORDER BY f.id_feedback DESC`,
				params
			);

			return res.status(200).json({ sucesso: rows });
		} catch (error) {
			return res.status(500).json({ erro: error });
		}
	}
	async VerFeedback(req, res) {
		try {
			if (req.user.role !== "cliente") {
				return res.status(403).json({ erro: "Apenas clientes podem consultar feedbacks" });
			}

			const id_feedback = req.params?.id;
			const id_cliente = req.user.id;

			if (!id_feedback) {
				return res.status(400).json({ erro: "id do feedback é obrigatório" });
			}

			const [rows] = await conn.promise().execute(
				`SELECT f.id_feedback, f.id_cliente, f.id_dieta, f.id_treino, f.texto,
								d.titulo_dieta, t.nome_treino
				 FROM feedback f
				 LEFT JOIN dietas d ON f.id_dieta = d.id_dieta
				 LEFT JOIN treinos t ON f.id_treino = t.id_treino
				 WHERE f.id_feedback = ? AND f.id_cliente = ?`,
				[id_feedback, id_cliente]
			);

			if (rows.length <= 0) {
				return res.status(404).json({ erro: "Feedback não encontrado" });
			}

			return res.status(200).json({ sucesso: rows[0] });
		} catch (error) {
			return res.status(500).json({ erro: error });
		}
	}
	async AtualizarFeedback(req, res) {
		try {
			if (req.user.role !== "cliente") {
				return res.status(403).json({ erro: "Apenas clientes podem atualizar feedbacks" });
			}

			const id_feedback = req.params?.id;
			const id_cliente = req.user.id;
			const { texto, id_dieta, id_treino } = req.body;

			if (!id_feedback) {
				return res.status(400).json({ erro: "id do feedback é obrigatório" });
			}

			const [feedbackRows] = await conn.promise().execute(
				"SELECT * FROM feedback WHERE id_feedback = ? AND id_cliente = ?",
				[id_feedback, id_cliente]
			);

			if (feedbackRows.length <= 0) {
				return res.status(404).json({ erro: "Feedback não encontrado" });
			}

			const feedbackAtual = feedbackRows[0];
			const textoAtualizado = texto !== undefined ? String(texto).trim() : String(feedbackAtual.texto || "").trim();

			if (!textoAtualizado) {
				return res.status(400).json({ erro: "Texto do feedback é obrigatório" });
			}

			const temDieta = id_dieta !== undefined && id_dieta !== null && id_dieta !== "";
			const temTreino = id_treino !== undefined && id_treino !== null && id_treino !== "";

			if (temDieta && temTreino) {
				return res.status(400).json({ erro: "Informe apenas id_dieta ou id_treino" });
			}

			const dietaFinal = temDieta ? id_dieta : feedbackAtual.id_dieta;
			const treinoFinal = temTreino ? id_treino : feedbackAtual.id_treino;

			if ((dietaFinal && treinoFinal) || (!dietaFinal && !treinoFinal)) {
				return res.status(400).json({ erro: "O feedback deve estar vinculado a uma dieta ou a um treino" });
			}

			if (dietaFinal) {
				const [dietaRows] = await conn.promise().execute(
					"SELECT id_dieta FROM dietas WHERE id_dieta = ? AND id_cliente = ?",
					[dietaFinal, id_cliente]
				);

				if (dietaRows.length <= 0) {
					return res.status(404).json({ erro: "Dieta não encontrada para este cliente" });
				}
			}

			if (treinoFinal) {
				const [treinoRows] = await conn.promise().execute(
					"SELECT id_treino FROM treinos WHERE id_treino = ? AND id_cliente = ?",
					[treinoFinal, id_cliente]
				);

				if (treinoRows.length <= 0) {
					return res.status(404).json({ erro: "Treino não encontrado para este cliente" });
				}
			}

			const [results] = await conn.promise().execute(
				"UPDATE feedback SET id_dieta = ?, id_treino = ?, texto = ? WHERE id_feedback = ? AND id_cliente = ?",
				[dietaFinal || null, treinoFinal || null, textoAtualizado, id_feedback, id_cliente]
			);

			if (results.affectedRows <= 0) {
				return res.status(500).json({ erro: "Não foi possível atualizar o feedback" });
			}

			return res.status(200).json({ sucesso: "Feedback atualizado com sucesso" });
		} catch (error) {
			return res.status(500).json({ erro: error });
		}
	}
	async DeletarFeedback(req, res) {
		try {
			if (req.user.role !== "cliente") {
				return res.status(403).json({ erro: "Apenas clientes podem deletar feedbacks" });
			}

			const id_feedback = req.params?.id;
			const id_cliente = req.user.id;

			if (!id_feedback) {
				return res.status(400).json({ erro: "id do feedback é obrigatório" });
			}

			const [feedbackRows] = await conn.promise().execute(
				"SELECT id_feedback FROM feedback WHERE id_feedback = ? AND id_cliente = ?",
				[id_feedback, id_cliente]
			);

			if (feedbackRows.length <= 0) {
				return res.status(404).json({ erro: "Feedback não encontrado" });
			}

			const [results] = await conn.promise().execute(
				"DELETE FROM feedback WHERE id_feedback = ? AND id_cliente = ?",
				[id_feedback, id_cliente]
			);

			if (results.affectedRows <= 0) {
				return res.status(500).json({ erro: "Não foi possível deletar o feedback" });
			}

			return res.status(200).json({ sucesso: "Feedback deletado com sucesso" });
		} catch (error) {
			return res.status(500).json({ erro: error });
		}
	}
}

export default new FeedbackController();