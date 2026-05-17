import conn from "../config/conn.js";
import Consulta from "../models/Consulta.js";

class ConsultaController {
  async VerificarConsultaPorCliente(req, res) {
    try {
      if (req.user.role !== "nutricionista") {
        return res.status(403).json({ erro: "Apenas nutricionistas podem consultar consultas" });
      }

      const id_cliente = req.query?.id;
      if (!id_cliente) {
        return res.status(400).json({ erro: "id do cliente é obrigatório" });
      }

      const id_nutricionista = req.user.id;

      const [clienteRows] = await conn.promise().execute(
        "SELECT id_cliente FROM clientes WHERE id_cliente = ? AND id_nutricionista = ?",
        [id_cliente, id_nutricionista]
      );

      if (clienteRows.length <= 0) {
        return res.status(404).json({ erro: "Cliente não encontrado para este nutricionista" });
      }

      const [consultaRows] = await conn.promise().execute(
        "SELECT COUNT(*) AS total FROM consultas WHERE id_cliente = ? AND id_nutricionista = ?",
        [id_cliente, id_nutricionista]
      );

      const total = consultaRows?.[0]?.total || 0;
      return res.status(200).json({ sucesso: { possuiConsulta: total > 0 } });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  async CriarConsulta(req, res) {
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

      const [clienteRows] = await conn.promise().execute(
        "SELECT id_cliente FROM clientes WHERE id_cliente = ? AND id_nutricionista = ?",
        [id_cliente, id_nutricionista]
      );

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

      const [results] = await conn.promise().execute(
        "INSERT INTO consultas (id_cliente, id_nutricionista, data_consulta, peso_atual, altura, alergias, restricoes_alimentares, historico_familiar, observacoes, metodos_utilizados) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        consulta.toArray()
      );

      if (results.affectedRows <= 0) {
        return res.status(500).json({ erro: "Não foi possível cadastrar a consulta" });
      }

      return res.status(201).json({ sucesso: "Consulta cadastrada com sucesso" });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  async AtualizarConsulta(req, res) {
    try {
      if (req.user.role !== "nutricionista") {
        return res.status(403).json({ erro: "Apenas nutricionistas podem atualizar consultas" });
      }

      const id_consulta = req.params?.id;
      if (!id_consulta) {
        return res.status(400).json({ erro: "id da consulta é obrigatório" });
      }

      const id_nutricionista = req.user.id;

      const [consultaRows] = await conn.promise().execute(
        "SELECT id_consulta FROM consultas WHERE id_consulta = ? AND id_nutricionista = ?",
        [id_consulta, id_nutricionista]
      );

      if (consultaRows.length <= 0) {
        return res.status(404).json({ erro: "Consulta não encontrada para este nutricionista" });
      }

      const {
        data_consulta,
        peso_atual,
        altura,
        alergias,
        restricoes_alimentares,
        historico_familiar,
        observacoes,
        metodos_utilizados
      } = req.body;

      if (!data_consulta) {
        return res.status(400).json({ erro: "Campo obrigatório faltando: data_consulta" });
      }

      const nowDate = new Date(Date.now());
      const consultaData = new Date(data_consulta);

      if (consultaData > nowDate) {
        return res.status(400).json({ erro: "Data de consulta inválida" });
      }

      const [results] = await conn.promise().execute(
        `UPDATE consultas
         SET data_consulta = ?, peso_atual = ?, altura = ?, alergias = ?,
             restricoes_alimentares = ?, historico_familiar = ?, observacoes = ?, metodos_utilizados = ?
         WHERE id_consulta = ? AND id_nutricionista = ?`,
        [
          data_consulta,
          peso_atual || null,
          altura || null,
          alergias || null,
          restricoes_alimentares || null,
          historico_familiar || null,
          observacoes || null,
          metodos_utilizados || null,
          id_consulta,
          id_nutricionista
        ]
      );

      if (results.affectedRows <= 0) {
        return res.status(500).json({ erro: "Não foi possível atualizar a consulta" });
      }

      return res.status(200).json({ sucesso: "Consulta atualizada com sucesso" });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  async DeletarConsulta(req, res) {
    try {
      if (req.user.role !== "nutricionista") {
        return res.status(403).json({ erro: "Apenas nutricionistas podem deletar consultas" });
      }

      const id_consulta = req.params?.id;
      if (!id_consulta) {
        return res.status(400).json({ erro: "id da consulta é obrigatório" });
      }

      const id_nutricionista = req.user.id;

      const [consultaRows] = await conn.promise().execute(
        "SELECT id_consulta FROM consultas WHERE id_consulta = ? AND id_nutricionista = ?",
        [id_consulta, id_nutricionista]
      );

      if (consultaRows.length <= 0) {
        return res.status(404).json({ erro: "Consulta não encontrada para este nutricionista" });
      }

      const [results] = await conn.promise().execute(
        "DELETE FROM consultas WHERE id_consulta = ? AND id_nutricionista = ?",
        [id_consulta, id_nutricionista]
      );

      if (results.affectedRows <= 0) {
        return res.status(500).json({ erro: "Não foi possível deletar a consulta" });
      }

      return res.status(200).json({ sucesso: "Consulta deletada com sucesso" });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
}

export default new ConsultaController();