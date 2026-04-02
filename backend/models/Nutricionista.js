class Nutricionista {
  constructor(nome, crn, email, senha, telefone, codigo) {
    this.nome = nome,
    this.crn = crn,
    this.email = email,
    this.senha = senha,
    this.telefone = telefone,
    this.codigo = codigo
  }

  toArray() {
    return [this.nome, this.crn, this.email, this.senha, this.telefone, this.codigo];
  }
}

export default Nutricionista;