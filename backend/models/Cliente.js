class Cliente {
  constructor(nome, email, senha, dataNasc, codigo, idNutri, objetivo) {
    this.nome = nome,
    this.email = email,
    this.senha = senha,
    this.dataNasc = dataNasc,
    this.codigo = codigo,
    this.idNutri = idNutri,
    this.objetivo = objetivo
  }

  toArray() {
    return [this.nome, this.email, this.senha, this.dataNasc, this.codigo, this.idNutri, this.objetivo];
  }
}

export default Cliente;