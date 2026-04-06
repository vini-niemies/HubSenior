class Functions {
  verificaToken = (req, res, next) => {
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
}

export default new Functions;