import express from "express";
import conn from "./config/conn.js";
import bcrypt from "bcrypt";
import Cliente from "./models/Cliente.js";
import Nutricionista from "./models/Nutricionista.js";

const app = express();
app.use(express.json());

const salt = 12;

conn.connect((error) => {
  if (error) console.log("erro" + error);
  else console.log("banco conectado");
})

app.post("/nutricionista", async (req, res) => {
  try {
    const { nome, crn, email, telefone } = req.body;
    const senha = await bcrypt.hash(req.body.senha, salt);
    if (!nome || !crn || !email || !telefone || !senha) return res.status(400).json({ erro: "Todos os dados devem ser preenchidos" });
    const codigo = await bcrypt.hash(nome + email, salt);
    const nutri = new Nutricionista(nome, crn, email, senha, telefone, codigo);
    conn.execute("INSERT INTO nutricionistas (nome, crn, email, senha, telefone, codigo) VALUES (?, ?, ? ,?, ?, ?)", nutri.toArray(), (error, results) => {
      if (error) return res.status(500).json({ erro: error });
      res.status(201).json({ sucesso: "Usuario Criado" });
    });
  } catch (error) {
    res.status(500).json({ erro: error });
  }

});

app.post("/cliente", async (req, res) => {
  try {
    const { nome, email, dataNasc, objetivo, codigo } = req.body;
    const senha = await bcrypt.hash(req.body.senha, salt);
    conn.execute("SELECT id_nutricionista FROM nutricionistas WHERE codigo = ?", [codigo], (error, rows) => {
      if (error) return res.status(500).json({ erro: error });
      if (rows.length <= 0) return res.status(404).json({ erro: "Erro ao atribuir conta a um nutricionista" });
      const { id_nutricionista } = rows[0];
      const cliente = new Cliente(nome, email, senha, dataNasc, codigo, id_nutricionista, objetivo);
      console.log(cliente)
      conn.execute("INSERT INTO clientes (nome, email, senha, data_nascimento, codigo_nutricionista, id_nutricionista, objetivo) VALUES (?, ?, ?, ?, ?, ?, ?)", cliente.toArray(), (error, results) => {
        if (error) return res.status(500).json({ erro: error });
        res.status(201).json({ sucesso: "Cliente Criado" });
      });
    });
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

app.post("/auth/login", (req, res) => {
  try {
    const { email, senha } = req.body;
    const role = "cliente";
    if (role === "cliente") {
      conn.execute("SELECT email, senha FROM clientes WHERE email = ?", [email], async (error, rows) => {
        if (rows.length <= 0) return res.status(404).json({ erro: "Erro ao fazer login" });
        const verificaSenha = await bcrypt.compare(senha, rows[0].senha);
        if (!verificaSenha) return res.status(400).json({ erro: "Erro ao fazer login" });
        return res.status(200).json({ sucesso: "Login realizado com sucesso" });
      });
    }
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

app.listen(3000, () => { console.log("server ligado") });