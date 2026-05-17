import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import conn from "../config/conn.js";
import Personal from "../models/Personal.js";

class PersonalController {
    async VerClientes(req, res) {
        try {
            const id = req.user.id;
            const [results] = await conn.promise().execute("SELECT id_cliente, nome, email, data_nascimento, endereco, objetivo FROM clientes WHERE id_personal = ?", [id]);
            return res.status(200).json({ sucesso: results });
        } catch (error) {
            return res.status(500).json({ erro: error });
        }
    }
    async VerDadosPersonal(req, res) {
        try {
            const id = req.user.id;
            const [rows] = await conn.promise().execute("SELECT * FROM personais WHERE id_personal = ?", [id]);
            if (!rows || rows.length === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
            return res.status(200).json({ sucesso: rows[0] });
        } catch (error) {
            return res.status(500).json({ erro: error });
        }
    }
    async CriarPersonal(req, res) {
        const salt = 12;
        try {
            const { nome, cref, email, senha, telefone, instagram, endereco } = req.body;

            if (!nome || !cref || !email || !senha || !telefone || !endereco) {
                return res.status(400).json({ erro: "Todos os campos devem ser preenchidos" });
            }

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ erro: "E-mail inválido" });
            }

            const [rows] = await conn.promise().execute("SELECT email FROM clientes UNION SELECT email FROM nutricionistas UNION SELECT email from personais");
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
            const personal = new Personal(nome, cref, email, senhaCriptografada, telefone, codigo, instagram, endereco);

            const [crefRows] = await conn.promise().execute("SELECT cref from personais");
            if (crefRows && crefRows.length > 0) {
                const crefsCadastrados = crefRows.map(c => c.cref);
                if (crefsCadastrados.includes(cref)) return res.status(409).json({ erro: "CREF já está cadastrado" });
            }

            await conn.promise().execute("INSERT INTO personais (nome, cref, email, senha, telefone, codigo, instagram, endereco) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", personal.toArray());
            return res.status(201).json({ sucesso: "Personal Criado com sucesso" });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ erro: error });
        }

    }
    async AtualizarPersonal(req, res) {
        try {
            const id = req.user.id;
            const { nome, email, telefone, instagram, endereco } = req.body;

            if (!nome || !email || !endereco) {
                return res.status(400).json({ erro: "Campos obrigatorios faltando: Nome, E-mail ou Endereço" });
            }

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ erro: "E-mail inválido" });
            }

            const [current] = await conn.promise().execute("SELECT email FROM personais WHERE id_personal = ?", [id]);
            if (!current || current.length === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
            const currentEmail = current[0].email;

            if (email !== currentEmail) {
                const [rows] = await conn.promise().execute("SELECT email FROM clientes UNION SELECT email FROM nutricionistas UNION SELECT email from personais");
                if (rows && rows.length > 0) {
                    const emailsCadastrados = rows.map(e => e.email);
                    if (emailsCadastrados.includes(email)) return res.status(409).json({ erro: "E-mail já está cadastrado" });
                }
            }

            const [results] = await conn.promise().execute(
                "UPDATE personais SET nome = ?, email = ?, telefone = ?, instagram = ?, endereco = ? WHERE id_personal = ?",
                [nome, email, telefone, instagram, endereco, id]
            );

            if (results.affectedRows === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
            return res.status(200).json({ sucesso: "Dados atualizados com sucesso" });
        } catch (error) {
            return res.status(500).json({ erro: error });
        }
    }
    async DeletarPersonal(req, res) {
        try {
            const id = req.user.id;

            await conn.promise().beginTransaction();
            try {
                await conn.promise().execute(
                    "UPDATE clientes SET codigo_personal = NULL, id_personal = NULL WHERE id_personal = ?",
                    [id]
                );

                const [results] = await conn.promise().execute(
                    "DELETE FROM personais WHERE id_personal = ?",
                    [id]
                );

                if (results.affectedRows === 0) {
                    await conn.promise().rollback();
                    return res.status(404).json({ erro: "Usuário não encontrado" });
                }

                await conn.promise().commit();
                return res.status(200).json({ sucesso: "Personal deletado com sucesso" });
            } catch (error) {
                await conn.promise().rollback();
                throw error;
            }
        } catch (error) {
            return res.status(500).json({ erro: error });
        }
    }
}

export default new PersonalController();