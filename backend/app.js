import express from "express";
import conn from "./config/conn.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Cliente from "./models/Cliente.js";
import Nutricionista from "./models/Nutricionista.js";
import Dieta from "./models/Dieta.js";
import ResultadoExames from "./models/resultado_exames.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000']
}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const salt = 12;

const cookieConfig = {
  httpOnly: true,
  secure: false,
  sameSite: 'Lax',
};

conn.connect((error) => {
  if (error) console.log("erro" + error);
  else console.log("banco conectado");
})

app.get("/nutri/clientes", verificaToken, async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;
    conn.execute("SELECT id_cliente, nome, email FROM clientes WHERE id_nutricionista = ?", [id], (error, rows) => {
      if (error) return res.status(500).json({ erro: error });
      if (rows.length <= 0) return res.status(200).json({ sucesso: rows });
      return res.status(200).json({ sucesso: rows });
    });
  } catch (error) {
    return res.status(500).json({ erro: error });
  }
});

app.post("/cliente", async (req, res) => {
  try {
    const { nome, email, senha, dataNasc, objetivo, codigo, endereco } = req.body;
    if (!nome || !email || !senha || !dataNasc || !objetivo || !codigo || !endereco) {
      return res.status(400).json({ erro: "Campos obrigatorios faltando: nome, email, senha, dataNasc, objetivo, codigo, endereco" });
    }
    const senhaCriptografada = await bcrypt.hash(senha, salt);
    conn.execute("SELECT id_nutricionista FROM nutricionistas WHERE codigo = ?", [codigo], (error, rows) => {
      if (error) return res.status(500).json({ erro: error });
      if (rows.length <= 0) return res.status(404).json({ erro: "Erro ao atribuir conta a um nutricionista" });
      const { id_nutricionista } = rows[0];
      const cliente = new Cliente(nome, email, senhaCriptografada, dataNasc, codigo, id_nutricionista, objetivo, endereco);
      conn.execute("INSERT INTO clientes (nome, email, senha, data_nascimento, codigo_nutricionista, id_nutricionista, objetivo, endereco) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", cliente.toArray(), (error, results) => {
        if (error) return res.status(500).json({ erro: error });
        return res.status(201).json({ sucesso: "Cliente Criado" });
      });
    });
  } catch (error) {
    return res.status(500).json({ erro: error });
  }
});

app.post("/auth/login", (req, res) => {
  try {
    const { role, email, senha } = req.body;
    if (!role || !email || !senha) {
      return res.status(400).json({ erro: "Campos obrigatorios faltando: role, email, senha" });
    }

    if (role === "cliente") {
      conn.execute("SELECT id_cliente, email, senha FROM clientes WHERE email = ?", [email], async (error, rows) => {
        if (error) return res.status(500).json({ erro: error });
        if (rows.length <= 0) return res.status(404).json({ erro: "Erro ao fazer login" });
        const verificaSenha = await bcrypt.compare(senha, rows[0].senha);
        if (!verificaSenha) return res.status(400).json({ erro: "Erro ao fazer login" });
        const accessToken = jwt.sign(
          { id: rows[0].id_cliente, email: rows[0].email, role: "cliente" },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRATION || "5m" }
        );
        const refreshToken = jwt.sign(
          { id: rows[0].id_cliente, email: rows[0].email, role: "cliente" },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d" }
        );
        res.cookie("refreshToken", refreshToken, {
          ...cookieConfig,
          maxAge: 1000 * 60 * 60 * 24 * 7 // 1 semana
        });
        res.cookie("accessToken", accessToken, {
          ...cookieConfig,
          maxAge: 1000 * 60 * 5 // 5 min
        });
        return res.status(200).json({ sucesso: "Login realizado com sucesso", accessToken });
      });
    } else if (role === "nutri") {
      conn.execute("SELECT id_nutricionista, email, senha FROM nutricionistas WHERE email = ?", [email], async (error, rows) => {
        if (error) return res.status(500).json({ erro: error });
        if (rows.length <= 0) return res.status(404).json({ erro: "Erro ao fazer login" });
        const verificaSenha = await bcrypt.compare(senha, rows[0].senha);
        if (!verificaSenha) return res.status(400).json({ erro: "Erro ao fazer login" });
        const accessToken = jwt.sign(
          { id: rows[0].id_nutricionista, email: rows[0].email, role: "nutricionista" },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRATION || "5m" }
        );
        const refreshToken = jwt.sign(
          { id: rows[0].id_nutricionista, email: rows[0].email, role: "nutricionista" },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d" }
        );
        res.cookie("refreshToken", refreshToken, {
          ...cookieConfig,
          maxAge: 1000 * 60 * 60 * 24 * 7 // 1 semana
        });
        res.cookie("accessToken", accessToken, {
          ...cookieConfig,
          maxAge: 1000 * 60 * 5 // 5 min
        });
        return res.status(200).json({ sucesso: "Login realizado com sucesso", accessToken });
      });
    } else {
      return res.status(400).json({ erro: "Campo role invalido. Use cliente ou nutri" });
    }
  } catch (error) {
    return res.status(500).json({ erro: error });
  }
});

app.post("/auth/logout", (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({ sucesso: "Deslogado com sucesso" });
  } catch (error) {
    return res.status(500).json({ erro: error });
  }
});
  
app.post("/auth/refresh", (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ erro: "Refresh token não fornecido" });
    jwt.verify(refreshToken, process.env.JWT_SECRET, (error, decoded) => {
      if (error) return res.status(403).json({ erro: "Refresh token inválido ou expirado" });
      const accessToken = jwt.sign({
        id: decoded.id || decoded.id_cliente,
        email: decoded.email,
        role: decoded.role
      },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "5m" }
      );
      res.cookie("accessToken", accessToken, {
        ...cookieConfig,
        maxAge: 1000 * 60 * 5
      });
      return res.status(200).json({ sucesso: "Token renovado", accessToken });
    });
  } catch (error) {
    return res.status(500).json({ erro: error });
  }
});

app.post("/dieta", verificaToken, (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "nutricionista") {
      return res.status(403).json({ erro: "Apenas nutricionistas podem cadastrar dietas" });
    }
    const {
      id_cliente,
      data_inicio,
      data_fim,
      titulo_dieta,
      refeicao1,
      refeicao2,
      refeicao3,
      refeicao4,
      detalhes_alimentos,
      objetivos
    } = req.body;

    if (!id_cliente || !data_inicio) {
      return res.status(400).json({ erro: "Campos obrigatorios faltando: id_cliente, data_inicio" });
    }

    const id_nutricionista = req.user.id || req.user.id_nutricionista;

    conn.execute(
      "SELECT id_cliente FROM clientes WHERE id_cliente = ? AND id_nutricionista = ?",
      [id_cliente, id_nutricionista],
      (error, rows) => {
        if (error) return res.status(500).json({ erro: error });
        if (rows.length <= 0) {
          return res.status(404).json({ erro: "Cliente não encontrado para este nutricionista" });
        }

        const dieta = new Dieta(
          id_cliente,
          id_nutricionista,
          data_inicio,
          data_fim || null,
          titulo_dieta || null,
          refeicao1 || null,
          refeicao2 || null,
          refeicao3 || null,
          refeicao4 || null,
          detalhes_alimentos || null,
          objetivos || null
        );

        conn.execute(
          "INSERT INTO dietas (id_cliente, id_nutricionista, data_inicio, data_fim, titulo_dieta, refeicao1, refeicao2, refeicao3, refeicao4, detalhes_alimentos, objetivos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          dieta.toArray(),
          (insertError, results) => {
            if (insertError) return res.status(500).json({ erro: insertError });
            return res.status(201).json({
              sucesso: "Dieta cadastrada com sucesso",
              id_dieta: results.insertId
            });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({ erro: error });
  }
});

app.post("/resultado-exames", verificaToken, (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "nutricionista") {
      return res.status(403).json({ erro: "Apenas nutricionistas podem cadastrar resultados de exames" });
    }

    const {
      id_cliente,
      data_realizacao,
      percentual_gordura,
      massa_magra,
      gordura_visceral,
      taxa_metabolica_basal,
      colesterol_total,
      glicemia_jejum,
      outros_marcadores
    } = req.body;

    if (!id_cliente || !data_realizacao) {
      return res.status(400).json({ erro: "Campos obrigatorios faltando: id_cliente, data_realizacao" });
    }

    const id_nutricionista = req.user.id || req.user.id_nutricionista;

    conn.execute(
      "SELECT id_cliente FROM clientes WHERE id_cliente = ? AND id_nutricionista = ?",
      [id_cliente, id_nutricionista],
      (error, rows) => {
        if (error) return res.status(500).json({ erro: error });
        if (rows.length <= 0) {
          return res.status(404).json({ erro: "Cliente nao encontrado para este nutricionista" });
        }

        const resultadoExames = new ResultadoExames(
          id_cliente,
          id_nutricionista,
          data_realizacao,
          percentual_gordura || null,
          massa_magra || null,
          gordura_visceral || null,
          taxa_metabolica_basal || null,
          colesterol_total || null,
          glicemia_jejum || null,
          outros_marcadores || null
        );

        conn.execute(
          "INSERT INTO resultados_exames (id_cliente, id_nutricionista, data_realizacao, percentual_gordura, massa_magra, gordura_visceral, taxa_metabolica_basal, colesterol_total, glicemia_jejum, outros_marcadores) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          resultadoExames.toArray(),
          (insertError, results) => {
            if (insertError) return res.status(500).json({ erro: insertError });
            return res.status(201).json({
              sucesso: "Resultado de exames cadastrado com sucesso",
              id_exame: results.insertId
            });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({ erro: error });
  }
});

app.listen(3000, () => { console.log("server ligado") });