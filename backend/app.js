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

const app = express();
app.use(cors({ 
  credentials: true,
  origin: 'http://127.0.0.1:5500' }
));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());

const salt = 12;

conn.connect((error) => {
  if (error) console.log("erro" + error);
  else console.log("banco conectado");
})

const verificaToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ erro: "token não fornecido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ erro: "token inválido ou expirado" })
  }
};

app.post("/nutricionista", async (req, res) => {
  try {
    const { nome, crn, email, telefone, instagram, endereco } = req.body;
    const senha = await bcrypt.hash(req.body.senha, salt);
    if (!nome || !crn || !email || !telefone || !senha) return res.status(400).json({ erro: "Todos os dados devem ser preenchidos" });
    const codigo = await bcrypt.hash(nome + email, salt);
    const nutri = new Nutricionista(nome, crn, email, senha, telefone, codigo, instagram, endereco);
    conn.execute("INSERT INTO nutricionistas (nome, crn, email, senha, telefone, codigo, instagram, endereco) VALUES (?, ?, ? ,?, ?, ?, ?, ?)", nutri.toArray(), (error, results) => {
      if (error) return res.status(500).json({ erro: error });
      res.status(201).json({ sucesso: "Usuario Criado" });
    });
  } catch (error) {
    res.status(500).json({ erro: error });
  }

});

app.post("/cliente", async (req, res) => {
  try {
    const { nome, email, dataNasc, objetivo, codigo, endereco } = req.body;
    const senha = await bcrypt.hash(req.body.senha, salt);
    conn.execute("SELECT id_nutricionista FROM nutricionistas WHERE codigo = ?", [codigo], (error, rows) => {
      if (error) return res.status(500).json({ erro: error });
      if (rows.length <= 0) return res.status(404).json({ erro: "Erro ao atribuir conta a um nutricionista" });
      const { id_nutricionista } = rows[0];
      const cliente = new Cliente(nome, email, senha, dataNasc, codigo, id_nutricionista, objetivo, endereco);
      conn.execute("INSERT INTO clientes (nome, email, senha, data_nascimento, codigo_nutricionista, id_nutricionista, objetivo, endereco) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", cliente.toArray(), (error, results) => {
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
    const { role, email, senha } = req.body;
    if (!role || !email || !senha) return res.status(400).json({ erro: "Erro ao fazer login, preencha todas as informações"})
    if (role === "cliente") {
      conn.execute("SELECT id_cliente, email, senha FROM clientes WHERE email = ?", [email], async (error, rows) => {
        if (rows.length <= 0) return res.status(404).json({ erro: "Erro ao fazer login" });
        const verificaSenha = await bcrypt.compare(senha, rows[0].senha);
        if (!verificaSenha) return res.status(400).json({ erro: "Erro ao fazer login" });
        const accessToken = jwt.sign(
          { id_cliente: rows[0].id_cliente, email: rows[0].email, role: "cliente" },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRATION }
        );
        const refreshToken = jwt.sign(
          { id_cliente: rows[0].id_cliente, email: rows[0].email, role: "cliente" },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d" }
        );
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
          maxAge: 1000 * 60 * 60 * 24 * 7 // 1 semana
        });
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
          maxAge: 1000 * 60 * 5 // 5 min
        });
        return res.status(200).json({ sucesso: "Login realizado com sucesso", accessToken });
      });
    } else if (role === "nutri") {
      conn.execute("SELECT id_nutricionista, email, senha FROM nutricionistas WHERE email = ?", [email], async (error, rows) => {
        if (rows.length <= 0) return res.status(404).json({ erro: "Erro ao fazer login" });
        const verificaSenha = await bcrypt.compare(senha, rows[0].senha);
        if (!verificaSenha) return res.status(400).json({ erro: "Erro ao fazer login" });
        const accessToken = jwt.sign(
          { id_nutricionista: rows[0].id_nutricionista, email: rows[0].email, role: "nutricionista" },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRATION }
        );
        const refreshToken = jwt.sign(
          { id_nutricionista: rows[0].id_nutricionista, email: rows[0].email, role: "nutricionista" },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d" }
        );
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
          maxAge: 1000 * 60 * 60 * 24 * 7 // 1 semana
        });
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
          maxAge: 1000 * 60 * 5 // 5 min
        });
        return res.status(200).json({ sucesso: "Login realizado com sucesso", accessToken });
      });
    }
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

app.post("/auth/logout", verificaToken, (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ sucesso: "Deslogado com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

app.post("/dieta", verificaToken, (req, res) => {
  try {
    if (req.user.role !== "nutricionista") {
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
      return res.status(400).json({ erro: "id_cliente e data_inicio são obrigatórios" });
    }

    const id_nutricionista = req.user.id_nutricionista;

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
    if (req.user.role !== "nutricionista") {
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
      return res.status(400).json({ erro: "id_cliente e data_realizacao sao obrigatorios" });
    }

    const id_nutricionista = req.user.id_nutricionista;

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