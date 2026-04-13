class Cliente {
  constructor(nome, email, senha, dataNasc, codigo, idNutri, objetivo, endereco, email2) {
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.dataNasc = dataNasc;
    this.codigo = codigo;
    this.idNutri = idNutri;
    this.objetivo = objetivo;
    this.endereco = endereco;
    this.email2 = email2;
  }

  toArray() {
    return [this.nome, this.email, this.senha, this.dataNasc, this.codigo, this.idNutri, this.objetivo, this.endereco, this.email2];
  }
}

export default Cliente;