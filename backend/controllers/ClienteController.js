import Cliente from "../models/Cliente.js";
import bcrypt from "bcrypt";
import conn from "../config/conn.js";

class ClienteController {

  async VerDadosCliente(req, res) {
    try {
      const id = req.user.id;
      conn.execute("SELECT * FROM clientes WHERE id = ?", [id], (error, rows) => {
        if (error) return res.status(404).json({ erro: "Usuário não encontrado" });
        return res.status(200).json({ sucesso: rows[0] });
      });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  async CriarCliente(req, res) {
    const salt = 12;
    try {
      const { nome, email, senha, dataNasc, objetivo, codigo, endereco, email2 } = req.body;
      if (!nome || !email || !senha || !dataNasc || !objetivo || !codigo || !endereco || !email2 ) {
        return res.status(400).json({ erro: "Campos obrigatorios faltando: nome, email, senha, dataNasc, objetivo, codigo, endereco" });
      }

      //if da validação vem aqui (email2 include):

      if (email2.includes("@")) {
        console.log("Email válido (contém @)");
      } else { return res.status(400).json({ erro: "Email inválido" }); }
      
      const senhaCriptografada = await bcrypt.hash(senha, salt);
      conn.execute("SELECT id_nutricionista FROM nutricionistas WHERE codigo = ?", [codigo], (error, rows) => {
        if (error) return res.status(500).json({ erro: error });
        if (rows.length <= 0) return res.status(404).json({ erro: "Erro ao atribuir conta a um nutricionista" });
        const { id_nutricionista } = rows[0];
        const cliente = new Cliente(nome, email, senhaCriptografada, dataNasc, codigo, id_nutricionista, objetivo, endereco, email2);
        conn.execute("INSERT INTO clientes (nome, email, senha, data_nascimento, codigo_nutricionista, id_nutricionista, objetivo, endereco, email2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", cliente.toArray(), (error, results) => {
          if (error) return res.status(500).json({ erro: error });
          return res.status(201).json({ sucesso: "Cliente Criado" });
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  async DeletarCliente(req, res) {
    try {
      const id = req.user.id;
      conn.execute("DELETE FROM clientes WHERE id = ?", [id], (error, results) => {
        if (error) return res.status(500).json({ erro: "Falha ao deletar usuário" });
        return res.status(200).json({ sucesso: "Usuário deletado com sucesso"});
      });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
}

export default new ClienteController;