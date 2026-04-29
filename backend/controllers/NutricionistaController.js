import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import conn from "../config/conn.js";
import Nutricionista from "../models/Nutricionista.js";


class NutricionistaController {
  async VerClientes(req, res) {
    try {
      const id = req.user.id;
      conn.execute("SELECT id_cliente, nome, email, data_nascimento, endereco, objetivo FROM clientes WHERE id_nutricionista = ?", [id], (error, results) => {
        if (error) return res.status(500).json({ erro: error });
        return res.status(200).json({ sucesso: results });
      });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
  async CriarNutricionista(req, res) {
    const salt = 12;
    try {
      const { nome, crn, email, senha, telefone, instagram, endereco } = req.body;

      if (!nome || !crn || !email || !senha || !telefone || !endereco) {
        return res.status(400).json({ erro: "Todos os campos além de instagram devem ser preenchidos" });
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: "E-mail inválido" });
      }

      const [rows] = await conn.promise().execute("SELECT email FROM clientes UNION SELECT email FROM nutricionistas");
      if (rows && rows.length > 0) {
        const emailsCadastrados = rows.map(e => e.email);
        if (emailsCadastrados.includes(email)) return res.status(409).json({ erro: "E-mail já está cadastrado" });
      }

      const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!senhaRegex.test(senha)) {
        return res.status(400).json({ erro: "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial." });
      }

      const senhaCriptografada = await bcrypt.hash(senha, salt);
      const codigo = await bcrypt.hash(nome + email, salt);
      const nutri = new Nutricionista(nome, crn, email, senhaCriptografada, telefone, codigo, instagram, endereco);

      const [crnRows] = await conn.promise().execute("SELECT crn from nutricionistas");
      if (crnRows && crnRows.length > 0) {
        const crnsCadastrados = crnRows.map(c => c.crn);
        if (crnsCadastrados.includes(crn)) return res.status(409).json({ erro: "CRN já está cadastrado" });
      }

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
  async AtualizarNutricionista(req, res) {
    try {
      const id = req.user.id;
      const { nome, email, telefone, instagram, endereco } = req.body;

      if (!nome || !email || !telefone || !instagram || !endereco) {
        return res.status(400).json({ erro: "Campos obrigatorios faltando: nome, email, telefone, instagram, endereco" });
      }

      conn.execute(
        "UPDATE nutricionistas SET nome = ?, email = ?, telefone = ?, instagram = ?, endereco = ? WHERE id_nutricionista = ?",
        [nome, email, telefone, instagram, endereco, id],
        (error, results) => {
          if (error) return res.status(500).json({ erro: error });
          if (results.affectedRows === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
          return res.status(200).json({ sucesso: "Dados atualizados com sucesso" });
        }
      );
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
  async DeletarNutricionista(req, res) {
    try {
      const id = req.user.id;

      conn.beginTransaction((transactionError) => {
        if (transactionError) return res.status(500).json({ erro: transactionError });

        conn.execute(
          "UPDATE clientes SET id_nutricionista = NULL WHERE id_nutricionista = ?",
          [id],
          (clientesError) => {
            if (clientesError) {
              return conn.rollback(() => res.status(500).json({ erro: clientesError }));
            }

            conn.execute(
              "UPDATE dietas SET id_nutricionista = NULL WHERE id_nutricionista = ?",
              [id],
              (dietasError) => {
                if (dietasError) {
                  return conn.rollback(() => res.status(500).json({ erro: dietasError }));
                }

                conn.execute(
                  "DELETE FROM nutricionistas WHERE id_nutricionista = ?",
                  [id],
                  (nutriError, results) => {
                    if (nutriError) {
                      return conn.rollback(() => res.status(500).json({ erro: nutriError }));
                    }

                    if (results.affectedRows === 0) {
                      return conn.rollback(() => res.status(404).json({ erro: "Usuário não encontrado" }));
                    }

                    conn.commit((commitError) => {
                      if (commitError) {
                        return conn.rollback(() => res.status(500).json({ erro: commitError }));
                      }

                      return res.status(200).json({ sucesso: "Usuário excluído com sucesso" });
                    });
                  }
                );
              }
            );
          }
        );
      });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
}

export default new NutricionistaController;