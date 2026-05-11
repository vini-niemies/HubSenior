class Cliente {
  constructor(nome, email, senha, dataNasc, codigo, idNutri, objetivo, endereco) {
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.dataNasc = dataNasc;
    this.codigo = codigo;
    this.idNutri = idNutri;
    this.objetivo = objetivo;
    this.endereco = endereco;
  }

  toArray() {
    return [this.nome, this.email, this.senha, this.dataNasc, this.codigo, this.idNutri, this.objetivo, this.endereco];
  }
}

export default Cliente;