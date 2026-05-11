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
            objetivos || null
          );

          conn.beginTransaction((transactionError) => {
            if (transactionError) return res.status(500).json({ erro: transactionError });

            conn.execute(
              "INSERT INTO dietas (id_cliente, id_nutricionista, data_inicio, data_fim, titulo_dieta, objetivos) VALUES (?, ?, ?, ?, ?, ?)",
              dieta.toArray(),
              (dietaError, dietaResult) => {
                if (dietaError) {
                  return conn.rollback(() => res.status(500).json({ erro: dietaError }));
                }

                const refeicoesValues = refeicoes.map((refeicao) => [
                  dietaResult.insertId,
                  refeicao.nome_refeicao,
                  refeicao.horario || null
                ]);

                const parametros = refeicoesValues.map(() => "(?, ?, ?)").join(", ");
                const valores = refeicoesValues.flat();

                conn.execute(
                  `INSERT INTO refeicoes (id_dieta, nome_refeicao, horario) VALUES ${parametros}`, valores, (erroRefeicoes) => {
                    if (erroRefeicoes) {
                      return conn.rollback(() => res.status(500).json({ erro: erroRefeicoes }));
                    }

                    conn.commit((erroCommit) => {
                      if (erroCommit) {
                        return conn.rollback(() => res.status(500).json({ erro: erroCommit }));
                      }

                      return res.status(201).json({ sucesso: "Dieta cadastrada com sucesso" });
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
      const { id } = req.body || {};
      const idCliente = id || req.query?.id;

      if (role === "nutricionista" && !idCliente) {
        return res.status(400).json({ erro: "id do cliente é obrigatório para nutricionista" });
      }

      const query = role === "nutricionista" ? "SELECT * FROM dietas WHERE id_cliente = ? AND id_nutricionista = ?" :
        "SELECT * FROM dietas WHERE id_cliente = ?";
      const params = role === "nutricionista" ? [idCliente, req.user.id] : [req.user.id];
      conn.execute(query, params, (error, dietasRows) => {
        if (error) return res.status(500).json({ erro: error });
        if (dietasRows.length <= 0) {
          return res.status(200).json({ sucesso: [] });
        }

        const idsDietas = dietasRows.map((dieta) => dieta.id_dieta);
        const parametros = idsDietas.map(() => "?").join(",");

        conn.execute(
          `SELECT * FROM refeicoes WHERE id_dieta IN (${parametros}) ORDER BY horario ASC`,
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

  VerDieta(req, res) {
    try {
      const role = req.user.role;
      const id_dieta = req.params.id_dieta;

      if (!id_dieta) {
        return res.status(400).json({ erro: "id da dieta é obrigatório" });
      }

      const query = role === "nutricionista" ? "SELECT * FROM dietas WHERE id_dieta = ? AND id_nutricionista = ?"
      : "SELECT * FROM dietas WHERE id_dieta = ? AND id_cliente = ?";
      const params = [id_dieta, req.user.id];
      conn.execute(query, params, (error, dietasRows) => {
        if (error) return res.status(500).json({ erro: error });
        if (dietasRows.length <= 0) {
          return res.status(404).json({ erro: "Dieta não encontrada" });
        }

        conn.execute(
          "SELECT * FROM refeicoes WHERE id_dieta = ? ORDER BY horario ASC",
          [id_dieta],
          (refeicoesError, refeicoesRows) => {
            if (refeicoesError) return res.status(500).json({ erro: refeicoesError });

            const dietaComRefeicoes = {
              ...dietasRows[0],
              refeicoes: refeicoesRows
            };

            return res.status(200).json({ sucesso: dietaComRefeicoes });
          }
        );
      });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  AtualizarDieta(req, res) {
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

      conn.execute(
        "SELECT id_dieta FROM dietas WHERE id_dieta = ? AND id_nutricionista = ?",
        [id_dieta, id_nutricionista],
        (buscarDietaErro, buscarDietaRows) => {
          if (buscarDietaErro) return res.status(500).json({ erro: buscarDietaErro });

          if (buscarDietaRows.length <= 0) {
            return res.status(404).json({ erro: "Dieta não encontrada para este nutricionista" });
          }

          conn.beginTransaction((transactionError) => {
            if (transactionError) return res.status(500).json({ erro: transactionError });

            conn.execute(
              "UPDATE dietas SET data_inicio = ?, data_fim = ?, titulo_dieta = ?, objetivos = ? WHERE id_dieta = ? AND id_nutricionista = ?",
              [data_inicio, data_fim || null, titulo_dieta, objetivos || null, id_dieta, id_nutricionista],
              (updateDietaError, updateDietaResult) => {
                if (updateDietaError) {
                  return conn.rollback(() => res.status(500).json({ erro: updateDietaError }));
                }

                if (updateDietaResult.affectedRows <= 0) {
                  return conn.rollback(() => res.status(404).json({ erro: "Dieta não encontrada" }));
                }

                conn.execute(
                  "DELETE FROM refeicoes WHERE id_dieta = ?",
                  [id_dieta],
                  (deleteRefeicoesError) => {
                    if (deleteRefeicoesError) {
                      return conn.rollback(() => res.status(500).json({ erro: deleteRefeicoesError }));
                    }

                    const refeicoesValues = refeicoes.map((refeicao) => [
                      id_dieta,
                      refeicao.nome_refeicao,
                      refeicao.horario || null
                    ]);

                    const parametros = refeicoesValues.map(() => "(?, ?, ?)").join(", ");
                    const valores = refeicoesValues.flat();

                    conn.execute(
                      `INSERT INTO refeicoes (id_dieta, nome_refeicao, horario) VALUES ${parametros}`,
                      valores,
                      (insertRefeicoesError) => {
                        if (insertRefeicoesError) {
                          return conn.rollback(() => res.status(500).json({ erro: insertRefeicoesError }));
                        }

                        conn.commit((commitError) => {
                          if (commitError) {
                            return conn.rollback(() => res.status(500).json({ erro: commitError }));
                          }

                          return res.status(200).json({ sucesso: "Dieta atualizada com sucesso" });
                        });
                      }
                    );
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

  ExcluirDieta(req, res) {
    try {
      if (req.user.role !== "nutricionista") {
        return res.status(403).json({ erro: "Apenas nutricionistas podem excluir dietas" });
      }

      const id_dieta = req.params.id;

      if (!id_dieta) {
        return res.status(400).json({ erro: "id da dieta inválido" });
      }

      const id_nutricionista = req.user.id;

      conn.execute(
        "SELECT id_dieta FROM dietas WHERE id_dieta = ? AND id_nutricionista = ?",
        [id_dieta, id_nutricionista],
        (buscarDietaErro, buscarDietaRows) => {
          if (buscarDietaErro) return res.status(500).json({ erro: buscarDietaErro });

          if (buscarDietaRows.length <= 0) {
            return res.status(404).json({ erro: "Dieta não encontrada para este nutricionista" });
          }

          conn.beginTransaction((transactionError) => {
            if (transactionError) return res.status(500).json({ erro: transactionError });

            conn.execute(
              "DELETE FROM refeicoes WHERE id_dieta = ?",
              [id_dieta],
              (refeicoesError) => {
                if (refeicoesError) {
                  return conn.rollback(() => res.status(500).json({ erro: refeicoesError }));
                }

                conn.execute(
                  "DELETE FROM dietas WHERE id_dieta = ? AND id_nutricionista = ?",
                  [id_dieta, id_nutricionista],
                  (dietaError, dietaResult) => {
                    if (dietaError) {
                      return conn.rollback(() => res.status(500).json({ erro: dietaError }));
                    }

                    if (dietaResult.affectedRows <= 0) {
                      return conn.rollback(() => res.status(404).json({ erro: "Dieta não encontrada" }));
                    }

                    conn.commit((commitError) => {
                      if (commitError) {
                        return conn.rollback(() => res.status(500).json({ erro: commitError }));
                      }

                      return res.status(200).json({ sucesso: "Dieta excluída com sucesso" });
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
}

export default new DietaController();
