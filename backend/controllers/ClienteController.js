import Cliente from "../models/Cliente.js";
import bcrypt from "bcrypt";
import conn from "../config/conn.js";

class ClienteController {

  async VerDadosCliente(req, res) {
    try {
      const id = req.user.id;
      const [rows] = await conn.promise().execute("SELECT * FROM clientes WHERE id_cliente = ?", [id]);
      if (!rows || rows.length === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
      return res.status(200).json({ sucesso: rows[0] });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
  async VerAssociadosCliente(req, res) {
    try {
      const id = req.user.id;
      const sql = "SELECT n.nome AS nutricionista_nome, p.nome AS personal_nome FROM clientes c LEFT JOIN nutricionistas n ON c.id_nutricionista = n.id_nutricionista LEFT JOIN personais p ON c.id_personal = p.id_personal WHERE c.id_cliente = ?";
      const [rows] = await conn.promise().execute(sql, [id]);
      if (!rows || rows.length === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
      return res.status(200).json({ sucesso: rows[0] });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
  async CriarCliente(req, res) {
    const salt = 12;
    try {
      const { nome, email, senha, dataNasc, objetivo, codigo, endereco } = req.body;

      if (!nome || !email || !senha || !dataNasc || !objetivo || !endereco) {
        return res.status(400).json({ erro: "Campos obrigatorios faltando: Nome, E-mail, Senha, Data de nascimento, Objetivo, Código de Nutricionista, Endereço" });
      }

      if (!codigo) {
        return res.status(400).json({ erro: "O código de nutricionista ou personal é necessário para criar a conta" });
      }

      const [rows] = await conn.promise().execute("SELECT email FROM clientes UNION SELECT email FROM nutricionistas UNION SELECT email from personais");
      if (rows && rows.length > 0) {
        const emailsCadastrados = rows.map(e => e.email);
        if (emailsCadastrados.includes(email)) return res.status(409).json({ erro: "E-mail já está cadastrado" });
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: "E-mail inválido" });
      }

      const dataCliente = new Date(dataNasc);
      const dataAtual = new Date();
      const dataCheck = new Date(
        dataAtual.getFullYear() - 18,
        dataAtual.getMonth(),
        dataAtual.getDate()
      );

      if (dataCliente > dataCheck) {
        return res.status(400).json({ erro: "Usuário deve ser maior de 18" });
      }

      const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!senhaRegex.test(senha)) {
        return res.status(400).json({ erro: "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial." });
      }

      const senhaCriptografada = await bcrypt.hash(senha, salt);

      const [nutriRows] = await conn.promise().execute(
        "SELECT id_nutricionista FROM nutricionistas WHERE codigo = ?",
        [codigo]
      );

      let id_nutricionista = null;
      let id_personal = null;
      let codigo_nutricionista = null;
      let codigo_personal = null;

      if (nutriRows && nutriRows.length > 0) {
        id_nutricionista = nutriRows[0].id_nutricionista;
        codigo_nutricionista = codigo;
      } else {
        const [persRows] = await conn.promise().execute(
          "SELECT id_personal FROM personais WHERE codigo = ?",
          [codigo]
        );

        if (persRows && persRows.length > 0) {
          id_personal = persRows[0].id_personal;
          codigo_personal = codigo;
        } else {
          return res.status(400).json({ erro: "Código inválido: não corresponde a nutricionista nem personal" });
        }
      }

      const query = `INSERT INTO clientes (nome, email, senha, data_nascimento, endereco, objetivo, codigo_nutricionista, codigo_personal, id_nutricionista, id_personal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const cliente = new Cliente(
        nome,
        email,
        senhaCriptografada,
        dataNasc,
        objetivo,
        endereco,
        codigo_nutricionista,
        codigo_personal,
        id_nutricionista,
        id_personal
      );

      const [result] = await conn.promise().execute(query, cliente.toArray());
      
      return res.status(201).json({ sucesso: "Cliente criado com sucesso" });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao criar cliente" });
    }
  }
  async InserirCodigo(req, res) {
    try {
      const id = req.user.id;
      const { codigo } = req.body;

      if (!codigo) {
        return res.status(400).json({ erro: "Código é obrigatório" });
      }

      const [nutriRows] = await conn.promise().execute(
        "SELECT id_nutricionista FROM nutricionistas WHERE codigo = ?",
        [codigo]
      );

      if (nutriRows && nutriRows.length > 0) {
        const id_nutricionista = nutriRows[0].id_nutricionista;

        const [clientRows] = await conn.promise().execute(
          "SELECT id_nutricionista FROM clientes WHERE id_cliente = ?",
          [id]
        );

        if (clientRows && clientRows.length > 0 && clientRows[0].id_nutricionista) {
          return res.status(409).json({ erro: "Você já possui um nutricionista associado" });
        }

        await conn.promise().execute(
          "UPDATE clientes SET codigo_nutricionista = ?, id_nutricionista = ? WHERE id_cliente = ?",
          [codigo, id_nutricionista, id]
        );

        return res.status(200).json({ sucesso: "Nutricionista adicionado com sucesso" });
      }

      const [persRows] = await conn.promise().execute(
        "SELECT id_personal FROM personais WHERE codigo = ?",
        [codigo]
      );

      if (persRows && persRows.length > 0) {
        const id_personal = persRows[0].id_personal;

        const [clientRows] = await conn.promise().execute(
          "SELECT id_personal FROM clientes WHERE id_cliente = ?",
          [id]
        );

        if (clientRows && clientRows.length > 0 && clientRows[0].id_personal) {
          return res.status(409).json({ erro: "Você já possui um personal trainer associado" });
        }

        await conn.promise().execute(
          "UPDATE clientes SET codigo_personal = ?, id_personal = ? WHERE id_cliente = ?",
          [codigo, id_personal, id]
        );

        return res.status(200).json({ sucesso: "Personal trainer adicionado com sucesso" });
      }
      return res.status(400).json({ erro: "Código inválido" });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
  async AtualizarCliente(req, res) {
    try {
      const id = req.user.id;
      const { nome, email, data_nascimento, endereco, objetivo } = req.body;

      if (!nome || !email || !data_nascimento || !endereco || !objetivo) {
        return res.status(400).json({ erro: "Todos os campos devem estar preenchidos" });
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: "E-mail inválido" });
      }

      const [current] = await conn.promise().execute("SELECT email FROM clientes WHERE id_cliente = ?", [id]);
      if (!current || current.length === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
      const currentEmail = current[0].email;

      if (email !== currentEmail) {
        const [rows] = await conn.promise().execute("SELECT email FROM clientes UNION SELECT email FROM nutricionistas UNION SELECT email from personais");
        if (rows && rows.length > 0) {
          const emailsCadastrados = rows.map(e => e.email);
          if (emailsCadastrados.includes(email)) return res.status(409).json({ erro: "E-mail já está cadastrado" });
        }
      }

      const dataCliente = new Date(data_nascimento);
      const dataAtual = new Date();
      const dataCheck = new Date(
        dataAtual.getFullYear() - 18,
        dataAtual.getMonth(),
        dataAtual.getDate()
      );

      if (dataCliente > dataCheck) {
        return res.status(400).json({ erro: "Usuário deve ser maior de 18" });
      }

      const [results] = await conn.promise().execute(
        "UPDATE clientes SET nome = ?, email = ?, data_nascimento = ?, endereco = ?, objetivo = ? WHERE id_cliente = ?",
        [nome, email, data_nascimento, endereco, objetivo, id]
      );
      if (results.affectedRows === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
      return res.status(200).json({ sucesso: "Dados atualizados com sucesso" });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
  async DeletarCliente(req, res) {
    try {
      const id = req.user.id;

      await conn.promise().beginTransaction();

      try {
        const [dietasRows] = await conn.promise().execute(
          "SELECT id_dieta FROM dietas WHERE id_cliente = ?",
          [id]
        );

        const idsDietas = dietasRows.map((dieta) => dieta.id_dieta);

        if (idsDietas.length > 0) {
          const parametros = idsDietas.map(() => "?").join(",");
          await conn.promise().execute(
            `DELETE FROM refeicoes WHERE id_dieta IN (${parametros})`,
            idsDietas
          );
        }

        await conn.promise().execute(
          "DELETE FROM dietas WHERE id_cliente = ?",
          [id]
        );

        const [results] = await conn.promise().execute(
          "DELETE FROM clientes WHERE id_cliente = ?",
          [id]
        );

        if (results.affectedRows === 0) {
          await conn.promise().rollback();
          return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        await conn.promise().commit();
        return res.status(200).json({ sucesso: "Usuário deletado com sucesso" });
      } catch (error) {
        await conn.promise().rollback();
        throw error;
      }
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }
}

export default new ClienteController;