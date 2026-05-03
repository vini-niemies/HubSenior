import conn from "../config/conn.js";
import Consulta from "../models/Consulta.js";

class ConsultaController {
  VerificarConsultaPorCliente(req, res) {
    try {
      if (req.user.role !== "nutricionista") {
        return res.status(403).json({ erro: "Apenas nutricionistas podem consultar consultas" });
      }

      const id_cliente = req.query?.id;
      if (!id_cliente) {
        return res.status(400).json({ erro: "id do cliente é obrigatório" });
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

          conn.execute(
            "SELECT COUNT(*) AS total FROM consultas WHERE id_cliente = ? AND id_nutricionista = ?",
            [id_cliente, id_nutricionista],
            (consultaError, consultaRows) => {
              if (consultaError) return res.status(500).json({ erro: consultaError });

              const total = consultaRows?.[0]?.total || 0;
              return res.status(200).json({ sucesso: { possuiConsulta: total > 0 } });
            }
          );
        }
      );
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  CriarConsulta(req, res) {
    try {
      if (req.user.role !== "nutricionista") {
        return res.status(403).json({ erro: "Apenas nutricionistas podem cadastrar consultas" });
      }

      const {
        id_cliente,
        data_consulta,
        peso_atual,
        altura,
        alergias,
        restricoes_alimentares,
        historico_familiar,
        observacoes,
        metodos_utilizados
      } = req.body;

      if (!id_cliente || !data_consulta) {
        return res.status(400).json({ erro: "Campos obrigatorios faltando: id_cliente, data_consulta" });
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

          const consulta = new Consulta(
            id_cliente,
            id_nutricionista,
            data_consulta,
            peso_atual || null,
            altura || null,
            alergias || null,
            restricoes_alimentares || null,
            historico_familiar || null,
            observacoes || null,
            metodos_utilizados || null
          );

          const nowDate = new Date(Date.now());
          const consultaData = new Date(data_consulta);
          
          if (consultaData > nowDate) {
            return res.status(400).json({ erro: "Data de consulta inválida" });
          }

          conn.execute(
            "INSERT INTO consultas (id_cliente, id_nutricionista, data_consulta, peso_atual, altura, alergias, restricoes_alimentares, historico_familiar, observacoes, metodos_utilizados) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            consulta.toArray(),
            (error, results) => {
              if (error) return res.status(500).json({ erro: error });
              if (results.affectedRows <= 0) {
                return res.status(500).json({ erro: "Não foi possível cadastrar a consulta" });
              }

              return res.status(201).json({ sucesso: "Consulta cadastrada com sucesso" });
            }
          );
        }
      );
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
}

export default new ConsultaController();
