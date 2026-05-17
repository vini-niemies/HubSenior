import conn from "../config/conn.js";
import Treino from "../models/Treino.js";

class TreinoController {
  async ListarDietas(req, res) {
    try {
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ erro: error });
    }
  }
  async CriarTreino(req, res) {
    try {
      if (req.user.role !== "personal") {
        return res.status(403).json({ erro: "Apenas personal trainers podem cadastrar treinos" });
      }

      const { id_cliente, nome_treino, dia_semana, objetivos, exercicios } = req.body;
      console.log(req.body);

      if (!id_cliente || !nome_treino || !dia_semana || !Array.isArray(exercicios) || exercicios.length < 1) {
        return res.status(400).json({ erro: "Campos obrigatorios faltando" });
      }

      for (const exercicio of exercicios) {
        const tempoDescanso = Number.parseInt(exercicio.tempo_descanso, 10);
        const repeticoes = Number.parseInt(exercicio.repeticoes, 10);
        const carga = Number.parseFloat(exercicio.carga);

        if (!exercicio.nome || !exercicio.grupo_muscular || !exercicio.tempoDescanso || !repeticoes || !carga) {
          return res.status(400).json({ erro: "Cada exercicio deve conter nome, grupo muscular, tempo de descanso, repeticoes e carga" });
        }

        if (!Number.isFinite(tempoDescanso) || !Number.isFinite(repeticoes) || !Number.isFinite(carga)) {
          return res.status(400).json({ erro: "Tempo de descanso, repeticoes e carga devem ser numeros validos" });
        }
      }

      const id_personal = req.user.id;

      const [clienteRows] = await conn.promise().execute(
        "SELECT id_cliente FROM clientes WHERE id_cliente = ? AND id_personal = ?",
        [id_cliente, id_personal]
      );

      if (clienteRows.length <= 0) {
        return res.status(404).json({ erro: "Cliente não encontrado para este personal" });
      }

      const treino = new Treino(id_cliente, id_personal, nome_treino, dia_semana, objetivos || null);

      await conn.promise().beginTransaction();

      try {
        const [treinoResult] = await conn.promise().execute(
          "INSERT INTO treinos (id_cliente, id_personal, nome_treino, dia_semana, objetivos) VALUES (?, ?, ?, ?, ?)",
          treino.toArray()
        );

        const exerciciosValues = exercicios.map((exercicio) => [
          treinoResult.insertId,
          exercicio.nome,
          exercicio.grupo_muscular,
          Number.parseInt(exercicio.tempo_descanso, 10),
          Number.parseInt(exercicio.repeticoes, 10),
          Number.parseFloat(exercicio.carga),
          exercicio.link_video
        ]);

        const parametros = exerciciosValues.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
        const valores = exerciciosValues.flat();

        await conn.promise().execute(
          `INSERT INTO exercicios (id_treino, nome_exercicio, grupo_muscular, tempo_descanso, repeticoes, carga, link_video) VALUES ${parametros}`,
          valores
        );

        await conn.promise().commit();
        return res.status(201).json({ sucesso: "Treino cadastrado com sucesso" });
      } catch (error) {
        await conn.promise().rollback();
        throw error;
      }
    } catch (error) {
      console.log(error)
      return res.status(500).json({ erro: error });
    }
  }
}

export default new TreinoController();