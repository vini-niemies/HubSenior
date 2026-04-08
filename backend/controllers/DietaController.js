import conn from "../config/conn.js";
import Dieta from "../models/Dieta.js";

class DietaController {
  CriarDieta(req, res) {
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
        observacoes_gerais,
        refeicoes
      } = req.body;

      if (!id_cliente || !data_inicio || !titulo_dieta || refeicoes.length < 1) {
        return res.status(400).json({ erro: "Campos obrigatorios faltando" });
      }

      for (const refeicao of refeicoes) {
        if (!refeicao.nome_refeicao) {
          return res.status(400).json({ erro: "Cada refeicao deve ser nomeada" });
        }
      }

      const id_nutricionista = req.user.id;

      conn.execute(
        "SELECT id_cliente FROM clientes WHERE id_cliente = ? AND id_nutricionista = ?",
        [id_cliente, id_nutricionista],
        (clienteError, clienteRows) => {
          if (clienteError) return res.status(500).json({ erro: clienteError });

          if (clienteRows.length <= 0) {
            return res.status(404).json({ erro: "Cliente não encontrado para este nutricionista" });
          }

          const dieta = new Dieta(
            id_cliente,
            id_nutricionista,
            data_inicio,
            data_fim || null,
            titulo_dieta,
            objetivos || null,
            observacoes_gerais || null
          );

          conn.beginTransaction((transactionError) => {
            if (transactionError) return res.status(500).json({ erro: transactionError });

            conn.execute(
              "INSERT INTO dietas (id_cliente, id_nutricionista, data_inicio, data_fim, titulo_dieta, objetivos, observacoes_gerais) VALUES (?, ?, ?, ?, ?, ?, ?)",
              dieta.toArray(),
              (dietaError, dietaResult) => {
                if (dietaError) {
                  return conn.rollback(() => res.status(500).json({ erro: dietaError }));
                }

                const refeicoesValues = refeicoes.map((refeicao) => [
                  dietaResult.insertId,
                  refeicao.nome_refeicao,
                  refeicao.horario || null,
                  refeicao.detalhes_alimentos || null
                ]);

                conn.query(
                  "INSERT INTO refeicoes (id_dieta, nome_refeicao, horario, detalhes_alimentos) VALUES ?",
                  [refeicoesValues],
                  (refeicoesError) => {
                    if (refeicoesError) {
                      return conn.rollback(() => res.status(500).json({ erro: refeicoesError }));
                    }

                    conn.commit((commitError) => {
                      if (commitError) {
                        return conn.rollback(() => res.status(500).json({ erro: commitError }));
                      }

                      return res.status(201).json({
                        sucesso: "Dieta cadastrada com sucesso",
                        id_dieta: dietaResult.insertId
                      });
                    });
                  }
                );
              }
            );
          });
        }
      );
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  ListarDietas(req, res) {
    try {
      const role = req.user.role;
      const { id } = req.body;
      const query = role === "nutri" ? "SELECT * FROM dietas WHERE id_cliente = ? AND id_nutricionista = ?" :
      "SELECT * FROM dietas WHERE id_cliente = ?";
      const params = role === "nutri" ? [req.user.id, id] : [id];
      conn.execute(query, [params], (error, dietasRows) => {
        if (error) return res.status(500).json({ erro: error });
        if (dietasRows.length <= 0) {
          return res.status(200).json({ sucesso: [] });
        }

        const idsDietas = dietasRows.map((dieta) => dieta.id_dieta);
        const placeholders = idsDietas.map(() => "?").join(",");

        conn.execute(
          `SELECT * FROM refeicoes WHERE id_dieta IN (${placeholders}) ORDER BY horario ASC`,
          idsDietas,
          (refeicoesError, refeicoesRows) => {
            if (refeicoesError) return res.status(500).json({ erro: refeicoesError });

            const refeicoesPorDieta = {};

            for (const refeicao of refeicoesRows) {
              if (!refeicoesPorDieta[refeicao.id_dieta]) {
                refeicoesPorDieta[refeicao.id_dieta] = [];
              }
              refeicoesPorDieta[refeicao.id_dieta].push(refeicao);
            }

            const dietasComRefeicoes = dietasRows.map((dieta) => ({
              ...dieta,
              refeicoes: refeicoesPorDieta[dieta.id_dieta] || []
            }));

            return res.status(200).json({ sucesso: dietasComRefeicoes });
          }
        );
      });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
}

export default new DietaController();
