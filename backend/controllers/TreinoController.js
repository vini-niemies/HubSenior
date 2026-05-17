import conn from "../config/conn.js";
import Treino from "../models/Treino.js";

class TreinoController {
  async VerTreino(req, res) {
    try {
      const id_treino = req.params.id;
      const user_id = req.user.id;

      const sql = req.user.role === "personal"
        ? "SELECT * FROM treinos WHERE id_treino = ? AND id_personal = ?"
        : "SELECT * FROM treinos WHERE id_treino = ? AND id_cliente = ?";
      const param = [id_treino, user_id];

      const [treinosRows] = await conn.promise().execute(sql, param);

      const resposta = [];

      for (const treino of treinosRows) {
        const [exRows] = await conn.promise().execute(
            "SELECT id_exercicio, id_treino, nome_exercicio, grupo_muscular, tempo_descanso, repeticoes, carga, link_video FROM exercicios WHERE id_treino = ?",
            [treino.id_treino]
          );

        const exercicios = exRows.map((ex) => ({
          id_exercicio: ex.id_exercicio,
          id_treino: ex.id_treino,
          nome: ex.nome_exercicio,
          grupo_muscular: ex.grupo_muscular,
          tempo_descanso: ex.tempo_descanso,
          repeticoes: ex.repeticoes,
          carga: ex.carga,
          link_video: ex.link_video,
        }));

        resposta.push({ ...treino, exercicios });
      }

      return res.json({ sucesso: resposta });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
  async ListarTreinos(req, res) {
    try {

      const role = req.user.role;
      const { id } = req.body || {};
      const idCliente = id || req.query?.id || (role === "cliente" ? req.user.id : null);

      if (!idCliente) {
        return res.status(400).json({ erro: "id do cliente é obrigatório" });
      }

      const sql = role === "personal"
        ? "SELECT * FROM treinos WHERE id_cliente = ? AND id_personal = ?"
        : "SELECT * FROM treinos WHERE id_cliente = ?";

      const queryParam = role === "cliente" ? req.user.id : idCliente;
      const param = role === "personal" ? [queryParam, req.user.id] : [queryParam];

      const [treinosRows] = await conn.promise().execute(sql, param);
      const resposta = [];

      for (const treino of treinosRows) {
        const [exRows] = await conn.promise().execute(
            "SELECT id_exercicio, id_treino, nome_exercicio, grupo_muscular, tempo_descanso, repeticoes, carga, link_video FROM exercicios WHERE id_treino = ?",
            [treino.id_treino]
          );

        const exercicios = exRows.map((ex) => ({
          id_exercicio: ex.id_exercicio,
          id_treino: ex.id_treino,
          nome: ex.nome_exercicio,
          grupo_muscular: ex.grupo_muscular,
          tempo_descanso: ex.tempo_descanso,
          repeticoes: ex.repeticoes,
          carga: ex.carga,
          link_video: ex.link_video,
        }));

        resposta.push({ ...treino, exercicios });
      }

      return res.json({ sucesso: resposta });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
  async CriarTreino(req, res) {
    try {
      if (req.user.role !== "personal") {
        return res.status(403).json({ erro: "Apenas personal trainers podem cadastrar treinos" });
      }

      const { id_cliente, nome_treino, dia_semana, objetivos, exercicios } = req.body;

      if (!id_cliente || !nome_treino || !dia_semana || !Array.isArray(exercicios) || exercicios.length < 1) {
        return res.status(400).json({ erro: "Campos obrigatorios faltando" });
      }

      for (const exercicio of exercicios) {
        const tempoDescanso = Number.parseInt(exercicio.tempo_descanso, 10);
        const repeticoes = Number.parseInt(exercicio.repeticoes, 10);
        const carga = Number.parseFloat(exercicio.carga);
        if (!exercicio.nome || !exercicio.grupo_muscular || !tempoDescanso || !repeticoes || !carga) {
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
        return res.status(201).json({ sucesso: "Treino cadastrado with sucesso" });
      } catch (error) {
        await conn.promise().rollback();
        throw error;
      }
    } catch (error) {
      console.log(error)
      return res.status(500).json({ erro: error });
    }
  }
  async AtualizarTreino(req, res) {
    try {
      if (req.user.role !== "personal") {
        return res.status(403).json({ erro: "Apenas personal trainers podem atualizar treinos" });
      }

      const { id_treino, nome_treino, dia_semana, objetivos, exercicios } = req.body;
      const id_personal = req.user.id;

      if (!id_treino || !nome_treino || !dia_semana || !Array.isArray(exercicios) || exercicios.length < 1) {
        return res.status(400).json({ erro: "Campos obrigatorios faltando" });
      }

      const [treinoRows] = await conn.promise().execute(
        "SELECT id_treino FROM treinos WHERE id_treino = ? AND id_personal = ?",
        [id_treino, id_personal]
      );

      if (treinoRows.length <= 0) {
        return res.status(404).json({ erro: "Treino não encontrado" });
      }

      for (const exercicio of exercicios) {
        const tempoDescanso = Number.parseInt(exercicio.tempo_descanso, 10);
        const repeticoes = Number.parseInt(exercicio.repeticoes, 10);
        const carga = Number.parseFloat(exercicio.carga);

        if (!exercicio.nome || !exercicio.grupo_muscular || isNaN(tempoDescanso) || isNaN(repeticoes) || isNaN(carga)) {
          return res.status(400).json({ erro: "Cada exercicio deve conter nome, grupo muscular, tempo de descanso, repeticoes e carga validos" });
        }
      }

      await conn.promise().beginTransaction();

      try {
        await conn.promise().execute(
          "UPDATE treinos SET nome_treino = ?, dia_semana = ?, objetivos = ? WHERE id_treino = ?",
          [nome_treino, dia_semana, objetivos || null, id_treino]
        );

        await conn.promise().execute("DELETE FROM exercicios WHERE id_treino = ?", [id_treino]);

        const exerciciosValues = exercicios.map((exercicio) => [
          id_treino,
          exercicio.nome,
          exercicio.grupo_muscular,
          Number.parseInt(exercicio.tempo_descanso, 10),
          Number.parseInt(exercicio.repeticoes, 10),
          Number.parseFloat(exercicio.carga),
          exercicio.link_video || null
        ]);

        const parametros = exerciciosValues.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
        const valores = exerciciosValues.flat();

        await conn.promise().execute(
          `INSERT INTO exercicios (id_treino, nome_exercicio, grupo_muscular, tempo_descanso, repeticoes, carga, link_video) VALUES ${parametros}`,
          valores
        );

        await conn.promise().commit();
        return res.status(200).json({ sucesso: "Treino atualizado com sucesso" });
      } catch (error) {
        await conn.promise().rollback();
        throw error;
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ erro: error });
    }
  }
  async DeletarTreino(req, res) {
    try {
      if (req.user.role !== "personal") {
        return res.status(403).json({ erro: "Apenas personal trainers podem deletar treinos" });
      }

      const { id } = req.params;
      const id_personal = req.user.id;

      const [treinoRows] = await conn.promise().execute(
        "SELECT id_treino FROM treinos WHERE id_treino = ? AND id_personal = ?",
        [id, id_personal]
      );

      if (treinoRows.length <= 0) {
        return res.status(404).json({ erro: "Treino não encontrado" });
      }

      await conn.promise().beginTransaction();

      try {
        await conn.promise().execute("DELETE FROM treinos WHERE id_treino = ?", [id]);
        await conn.promise().commit();
        return res.status(200).json({ sucesso: "Treino deletado com sucesso" });
      } catch (error) {
        await conn.promise().rollback();
        throw error;
      }
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
}

export default new TreinoController();