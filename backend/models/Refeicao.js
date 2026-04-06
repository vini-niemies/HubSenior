class Refeicao {
  constructor(idDieta, nomeRefeicao, horario, detalhesAlimentos) {
    this.idDieta = idDieta;
    this.nomeRefeicao = nomeRefeicao;
    this.horario = horario;
    this.detalhesAlimentos = detalhesAlimentos;
  }

  toArray() {
    return [
      this.idDieta,
      this.nomeRefeicao,
      this.horario,
      this.detalhesAlimentos
    ];
  }
}

export default Refeicao;
