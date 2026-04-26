import Cliente from "../models/Cliente.js";
import bcrypt from "bcrypt";
import conn from "../config/conn.js";

class ClienteController {

  async VerDadosCliente(req, res) {
    try {
      const id = req.user.id;
      conn.execute("SELECT * FROM clientes WHERE id_cliente = ?", [id], (error, rows) => {
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
      console.log(error);
    }
  }
  async AtualizarCliente(req, res) {
    try {
      const id = req.user.id;
      const { nome, email, data_nascimento, endereco, objetivo } = req.body;

      if (!nome || !email || !data_nascimento || !endereco || !objetivo) {
        return res.status(400).json({ erro: "Campos obrigatorios faltando: nome, email, data_nascimento, endereco, objetivo" });
      }

      conn.execute(
        "UPDATE clientes SET nome = ?, email = ?, data_nascimento = ?, endereco = ?, objetivo = ? WHERE id_cliente = ?",
        [nome, email, data_nascimento, endereco, objetivo, id],
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
  async DeletarCliente(req, res) {
    try {
      const id = req.user.id;

      conn.beginTransaction((transactionError) => {
        if (transactionError) return res.status(500).json({ erro: transactionError });

        conn.execute(
          "SELECT id_dieta FROM dietas WHERE id_cliente = ?",
          [id],
          (dietasError, dietasRows) => {
            if (dietasError) {
              return conn.rollback(() => res.status(500).json({ erro: dietasError }));
            }

            const idsDietas = dietasRows.map((dieta) => dieta.id_dieta);

            const excluirCliente = () => {
              conn.execute(
                "DELETE FROM clientes WHERE id_cliente = ?",
                [id],
                (clienteError, results) => {
                  if (clienteError) {
                    return conn.rollback(() => res.status(500).json({ erro: clienteError }));
                  }

                  if (results.affectedRows === 0) {
                    return conn.rollback(() => res.status(404).json({ erro: "Usuário não encontrado" }));
                  }

                  conn.commit((commitError) => {
                    if (commitError) {
                      return conn.rollback(() => res.status(500).json({ erro: commitError }));
                    }

                    return res.status(200).json({ sucesso: "Usuário deletado com sucesso" });
                  });
                }
              );
            };

            if (idsDietas.length <= 0) {
              return excluirCliente();
            }

            const parametros = idsDietas.map(() => "?").join(",");
            conn.execute(
              `DELETE FROM refeicoes WHERE id_dieta IN (${parametros})`,
              idsDietas,
              (refeicoesError) => {
                if (refeicoesError) {
                  return conn.rollback(() => res.status(500).json({ erro: refeicoesError }));
                }

                conn.execute(
                  "DELETE FROM dietas WHERE id_cliente = ?",
                  [id],
                  (dietasDeleteError) => {
                    if (dietasDeleteError) {
                      return conn.rollback(() => res.status(500).json({ erro: dietasDeleteError }));
                    }

                    excluirCliente();
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

export default new ClienteController;