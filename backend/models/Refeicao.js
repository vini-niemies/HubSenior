class Refeicao {
  constructor(idDieta, nomeRefeicao, horario) {
    this.idDieta = idDieta;
    this.nomeRefeicao = nomeRefeicao;
    this.horario = horario;
  }

  toArray() {
    return [this.idDieta, this.nomeRefeicao, this.horario];
  }
}

export default Refeicao;