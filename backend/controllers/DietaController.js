import conn from "../config/conn.js";
import Dieta from "../models/Dieta.js";
import Refeicao from "../models/Refeicao.js";

class DietaController {
  VerDietas(req, res) {
    try {
      if (req.user.role !== "nutricionista") return res.status(403).json({ erro: "Acesso negado" });
      const { id } = req.body;
      conn.execute("SELECT * FROM dietas WHERE id_cliente = ? AND id_nutricionista = ?", [id, req.user.id], (error, rows) => {
        if (error) return res.status(500).json({ erro: "Falha ao encontrar dietas de cliente" });
        
        if (rows.length <= 0) {
          return res.status(200).json({ sucesso: [] });
        }

        const dietasComRefeicoes = [];
        let dietasProcessadas = 0;

        rows.forEach((d, index) => {
          conn.execute("SELECT * FROM refeicoes WHERE id_dieta = ?", [d.id_dieta], (error, results) => {
            if (error) return res.status(500).json({ erro: "Falha ao encontrar refeições de dietas" });
            
            dietasComRefeicoes[index] = { ...d, refeicoes: results };
            dietasProcessadas++;
            
            if (dietasProcessadas === rows.length) {
              return res.status(200).json({ sucesso: dietasComRefeicoes });
            }
          });
        });
      });
    } catch(error) {
      return res.status(500).json({ erro: error });
    }
  }
  CriarDieta(req, res) {
    try {
      if (req.user.role !== "nutricionista") {
        return res.status(403).json({ erro: "Apenas nutricionistas podem cadastrar dietas" });
      }
      const { idCliente, dataInicio, dataFim, tituloDieta, refeicao1, refeicao2, refeicao3, refeicao4, objetivos } = req.body;

      if (!idCliente || !dataInicio || !dataFim || !tituloDieta || !refeicao1 || !refeicao2 || !refeicao3 || !refeicao4 || !objetivos) {
        return res.status(400).json({ erro: "Todos os campos devem ser preenchidos" });
      }
      conn.execute(
        "SELECT id_cliente FROM clientes WHERE id_cliente = ? AND id_nutricionista = ?",
        [idCliente, req.user.id],
        (clienteError, clienteRows) => {
          if (clienteError) return res.status(500).json({ erro: clienteError });
          if (clienteRows.length <= 0) {
            return res.status(404).json({ erro: "Cliente não encontrado para este nutricionista" });
          }

          const dieta = new Dieta(idCliente, req.user.id, dataInicio, dataFim, tituloDieta, objetivos);

          conn.execute(
            "INSERT INTO dietas (id_cliente, id_nutricionista, data_inicio, data_fim, titulo_dieta, objetivos) VALUES (?, ?, ?, ?, ?, ?)",
            dieta.toArray(),
            (error, results) => {
              if (error) return res.status(500).json({ erro: "Erro ao criar dieta" });

              const refeicoes = [
                { prato: refeicao1, horario: "06:00:00" },
                { prato: refeicao2, horario: "12:00:00" },
                { prato: refeicao3, horario: "16:00:00" },
                { prato: refeicao4, horario: "20:00:00" }
              ];

              let refeicoesInseridas = 0;
              let erroOcorreu = false;
              const idDieta = results.insertId;

              refeicoes.forEach(r => {
                const refeicao = new Refeicao(idDieta, r.prato, r.horario);
                conn.execute("INSERT INTO refeicoes (id_dieta, nome_refeicao, horario) VALUES (?, ?, ?)", refeicao.toArray(),
                  (error) => {
                    if (error && !erroOcorreu) {
                      erroOcorreu = true;
                      return res.status(500).json({ erro: error.message || "Erro ao inserir refeição" });
                    }
                    
                    if (!erroOcorreu) {
                      refeicoesInseridas++;
                      if (refeicoesInseridas === refeicoes.length) {
                        return res.status(201).json({ sucesso: "Dieta cadastrada com sucesso" });
                      }
                    }
                  }
                );
              });
            }
          );
        }
      );
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
  
}

export default new DietaController();
