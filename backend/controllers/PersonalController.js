import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import conn from "../config/conn.js";
import Personal from "../models/Personal.js";

class PersonalController {
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
}

export default new PersonalController();