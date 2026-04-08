import bcrypt from "bcrypt";
import conn from "../config/conn.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class AuthController {

  async CheckLogin(req, res) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ erro: "Sem permissão para acessar esse recurso" });
      return res.status(200).json({ sucesso: "Usuário permitido" });
    } catch(error) {
      return res.status(500).json({ erro: error });
    }

  }

  async Login(req, res) {

    const cookieConfig = {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    };

    try {
      const { role, email, senha } = req.body;
      if (!role || !email || !senha) {
        return res.status(400).json({ erro: "Todos os campos devem ser preenchidos" });
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
  }

  async Logout(req, res) {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(200).json({ sucesso: "Deslogado com sucesso" });
    } catch (error) {
      return res.status(500).json({ erro: error });
    }
  }

  async Refresh(req, res) {

    const cookieConfig = {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    };
    
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
      return res.status(500).json({ erro: error.message || error });
    }
  }
}

export default new AuthController;