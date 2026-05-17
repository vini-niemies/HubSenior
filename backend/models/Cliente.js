class Cliente {
  constructor(nome, email, senha, dataNasc, objetivo, endereco, codigoNutri, codigoPersonal, idNutri, idPersonal) {
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.dataNasc = dataNasc;
    this.objetivo = objetivo;
    this.endereco = endereco;
    this.codigoNutri = codigoNutri;
    this.codigoPersonal = codigoPersonal;
    this.idNutri = idNutri;
    this.idPersonal = idPersonal;
  }

  toArray() {
    return [this.nome, this.email, this.senha, this.dataNasc, this.objetivo, this.endereco, this.codigoNutri, this.codigoPersonal, this.idNutri, this.idPersonal];
  }
}

export default Cliente;