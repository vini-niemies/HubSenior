import conn from "../config/conn.js";
import Dieta from "../models/Dieta.js";

class DietaController {
  async CriarDieta(req, res) {
    try {
      if (req.user.role !== "nutricionista") {
        return res.status(403).json({ erro: "Apenas nutricionistas podem cadastrar dietas" });
      }

      const {
        id_cliente,
        data_inicio,
        data_fim,
        titulo_dieta,
        objetivos,
        refeicoes
      } = req.body;

      if (!id_cliente || !data_inicio || !titulo_dieta || refeicoes.length < 1) {
        return res.status(400).json({ erro: "Campos obrigatorios faltando" });
      }

      if (refeicoes.length > 6) return res.status(400).json({ erro: "Limite de refeições (6) ultrapassado" });

      for (const refeicao of refeicoes) {
        if (!refeicao.nome_refeicao) {
          return res.status(400).json({ erro: "Cada refeicao deve ser nomeada" });
        }
      }

      const id_nutricionista = req.user.id;

      try {
        const [clienteRows] = await conn.promise().execute(
          "SELECT id_cliente FROM clientes WHERE id_cliente = ? AND id_nutricionista = ?",
          [id_cliente, id_nutricionista]
        );

        if (clienteRows.length <= 0) {
          return res.status(404).json({ erro: "Cliente não encontrado for este nutricionista" });
        }

        const dieta = new Dieta(
          id_cliente,
          id_nutricionista,
          data_inicio,
          data_fim || null,
          titulo_dieta,
          objetivos || null
        );

        await conn.promise().beginTransaction();

        const [dietaResult] = await conn.promise().execute(
          "INSERT INTO dietas (id_cliente, id_nutricionista, data_inicio, data_fim, titulo_dieta, objetivos) VALUES (?, ?, ?, ?, ?, ?)",
          dieta.toArray()
        );

        const refeicoesValues = refeicoes.map((refeicao) => [
          dietaResult.insertId,
          refeicao.nome_refeicao,
          refeicao.horario || null
        ]);

        const parametros = refeicoesValues.map(() => "(?, ?, ?)").join(", ");
        const valores = refeicoesValues.flat();

        await conn.promise().execute(
          `INSERT INTO refeicoes (id_dieta, nome_refeicao, horario) VALUES ${parametros}`,
          valores
        );

        await conn.promise().commit();
        return res.status(201).json({ sucesso: "Dieta cadastrada com sucesso" });
      } catch (error) {
        await conn.promise().rollback();
        throw error;
      }
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  async ListarDietas(req, res) {
    try {

      const role = req.user.role;
      const { id } = req.body || {};
      const idCliente = id || req.query?.id || (role === "cliente" ? req.user.id : null);

      if (!idCliente) {
        return res.status(400).json({ erro: "id do cliente é obrigatório" });
      }

      const query = role === "nutricionista" ? "SELECT * FROM dietas WHERE id_cliente = ? AND id_nutricionista = ?" :
        "SELECT * FROM dietas WHERE id_cliente = ?";
      
      const queryParam = role === "cliente" ? req.user.id : idCliente;
      const params = role === "nutricionista" ? [queryParam, req.user.id] : [queryParam];
      
      const [dietasRows] = await conn.promise().execute(query, params);
      
      if (dietasRows.length <= 0) {
        return res.status(200).json({ sucesso: [] });
      }

      const idsDietas = dietasRows.map((dieta) => dieta.id_dieta);
      const parametros = idsDietas.map(() => "?").join(",");

      const [refeicoesRows] = await conn.promise().execute(
        `SELECT * FROM refeicoes WHERE id_dieta IN (${parametros}) ORDER BY horario ASC`,
        idsDietas
      );

      const refeicoesPorDieta = {};

      for (const refeicao of refeicoesRows) {
        if (!refeicoesPorDieta[refeicao.id_dieta]) {
          refeicoesPorDieta[refeicao.id_dieta] = [];
        }
        refeicoesPorDieta[refeicao.id_dieta].push(refeicao);
      }

      const dietasComRefeicoes = dietasRows.map((dieta) => (
        {
        ...dieta,
        refeicoes: refeicoesPorDieta[dieta.id_dieta] || []
      }));

      return res.status(200).json({ sucesso: dietasComRefeicoes });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  async VerDieta(req, res) {
    try {
      const role = req.user.role;
      const id_dieta = req.params.id_dieta;

      if (!id_dieta) {
        return res.status(400).json({ erro: "id da dieta é obrigatório" });
      }

      const query = role === "nutricionista" ? "SELECT * FROM dietas WHERE id_dieta = ? AND id_nutricionista = ?"
      : "SELECT * FROM dietas WHERE id_dieta = ? AND id_cliente = ?";
      const params = [id_dieta, req.user.id];
      
      const [dietasRows] = await conn.promise().execute(query, params);
      
      if (dietasRows.length <= 0) {
        return res.status(404).json({ erro: "Dieta não encontrada" });
      }

      const [refeicoesRows] = await conn.promise().execute(
        "SELECT * FROM refeicoes WHERE id_dieta = ? ORDER BY horario ASC",
        [id_dieta]
      );

      const dietaComRefeicoes = {
        ...dietasRows[0],
        refeicoes: refeicoesRows
      };

      return res.status(200).json({ sucesso: dietaComRefeicoes });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  async AtualizarDieta(req, res) {
    try {
      if (req.user.role !== "nutricionista") {
        return res.status(403).json({ erro: "Apenas nutricionistas podem atualizar dietas" });
      }

      const id_dieta = req.params.id;
      const {
        data_inicio,
        data_fim,
        titulo_dieta,
        objetivos,
        refeicoes
      } = req.body;

      if (!id_dieta) {
        return res.status(400).json({ erro: "id da dieta inválido" });
      }

      if (!data_inicio || !titulo_dieta || !Array.isArray(refeicoes) || refeicoes.length < 1) {
        return res.status(400).json({ erro: "Campos obrigatorios faltando" });
      }

      if (refeicoes.length > 6) {
        return res.status(400).json({ erro: "Limite de refeições (6) ultrapassado" });
      }

      for (const refeicao of refeicoes) {
        if (!refeicao.nome_refeicao) {
          return res.status(400).json({ erro: "Cada refeicao deve ser nomeada" });
        }
      }

      const id_nutricionista = req.user.id;

      try {
        const [buscarDietaRows] = await conn.promise().execute(
          "SELECT id_dieta FROM dietas WHERE id_dieta = ? AND id_nutricionista = ?",
          [id_dieta, id_nutricionista]
        );

        if (buscarDietaRows.length <= 0) {
          return res.status(404).json({ erro: "Dieta não encontrada for este nutricionista" });
        }

        await conn.promise().beginTransaction();

        const [updateDietaResult] = await conn.promise().execute(
          "UPDATE dietas SET data_inicio = ?, data_fim = ?, titulo_dieta = ?, objetivos = ? WHERE id_dieta = ? AND id_nutricionista = ?",
          [data_inicio, data_fim || null, titulo_dieta, objetivos || null, id_dieta, id_nutricionista]
        );

        if (updateDietaResult.affectedRows <= 0) {
          await conn.promise().rollback();
          return res.status(404).json({ erro: "Dieta não encontrada" });
        }

        await conn.promise().execute(
          "DELETE FROM refeicoes WHERE id_dieta = ?",
          [id_dieta]
        );

        const refeicoesValues = refeicoes.map((refeicao) => [
          id_dieta,
          refeicao.nome_refeicao,
          refeicao.horario || null
        ]);

        const parametros = refeicoesValues.map(() => "(?, ?, ?)").join(", ");
        const valores = refeicoesValues.flat();

        await conn.promise().execute(
          `INSERT INTO refeicoes (id_dieta, nome_refeicao, horario) VALUES ${parametros}`,
          valores
        );

        await conn.promise().commit();
        return res.status(200).json({ sucesso: "Dieta atualizada com sucesso" });
      } catch (error) {
        await conn.promise().rollback();
        throw error;
      }
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  async ExcluirDieta(req, res) {
    try {
      if (req.user.role !== "nutricionista") {
        return res.status(403).json({ erro: "Apenas nutricionistas podem excluir dietas" });
      }

      const id_dieta = req.params.id;

      if (!id_dieta) {
        return res.status(400).json({ erro: "id da dieta inválido" });
      }

      const id_nutricionista = req.user.id;

      try {
        const [dietaResult] = await conn.promise().execute(
          "DELETE FROM dietas WHERE id_dieta = ? AND id_nutricionista = ?",
          [id_dieta, id_nutricionista]
        );

        if (dietaResult.affectedRows <= 0) {
          await conn.promise().rollback();
          return res.status(404).json({ erro: "Dieta não encontrada" });
        }

        await conn.promise().commit();
        return res.status(200).json({ sucesso: "Dieta excluída com sucesso" });
      } catch (error) {
        await conn.promise().rollback();
        throw error;
      }
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
}

export default new DietaController();