class Nutricionista {
  constructor(nome, crn, email, senha, telefone, codigo, instagram, endereco) {
    this.nome = nome;
      this.crn = crn;
      this.email = email;
      this.senha = senha;
      this.telefone = telefone;
      this.codigo = codigo;
      this.instagram = instagram;
      this.endereco = endereco
  }

  toArray() {
    return [this.nome, this.crn, this.email, this.senha, this.telefone, this.codigo, this.instagram, this.endereco];
  }
}

export default Nutricionista;