import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import conn from "../config/conn.js";
import Nutricionista from "../models/Nutricionista.js";


class NutricionistaController {
  async VerClientes(req, res) {
    try {
      const id = req.user.id;
      conn.execute("SELECT * FROM clientes WHERE id_nutricionista = ?", [id], (error, results) => {
        if (error) return res.status(500).json({ erro: error });
        return res.status(200).json({ sucesso: results });
      });
    } catch(error) {
      return res.status(500).json({ erro: error });
    }
  }
  async CriarNutricionista(req, res) {
    const salt = 12;
    try {
      const { nome, crn, email, senha, telefone, instagram, endereco } = req.body;
      if (!nome || !crn || !email || !senha || !telefone) {
        return res.status(400).json({ erro: "Todos os campos devem ser preenchidos" });
      }
      const senhaCriptografada = await bcrypt.hash(senha, salt);
      const codigo = await bcrypt.hash(nome + email, salt);
      const nutri = new Nutricionista(nome, crn, email, senhaCriptografada, telefone, codigo, instagram, endereco);
      conn.execute("INSERT INTO nutricionistas (nome, crn, email, senha, telefone, codigo, instagram, endereco) VALUES (?, ?, ? ,?, ?, ?, ?, ?)", nutri.toArray(), (error, results) => {
        if (error) return res.status(500).json({ erro: error });
        return res.status(201).json({ sucesso: "Usuario Criado" });
      });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
  async VerDadosNutricionista(req, res) {
    try {
      const id = req.user.id;
      conn.execute("SELECT * FROM nutricionistas WHERE id_nutricionista = ?", [id], (error, rows) => {
        if (error) return res.status(500).json({ erro: error });
        return res.status(200).json({ sucesso: rows[0] });
      });
    } catch (error) {
      
      return res.status(500).json({ erro: error });
    }
  }
  async DeletarNutricionista(req, res) {
    try {
      const token = req.cookies.accessToken;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const id = decoded.id;
      conn.execute("DELETE FROM nutricionistas WHERE id = ?", [id], (error, results) => {
        if (error) return res.status(500).json({ erro: error });
        return res.status.json({ sucesso: "Usuário excluído com sucesso" });
      });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  } 
}

export default new NutricionistaController;