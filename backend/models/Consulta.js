class Consulta {
  constructor(idCliente, idNutricionista, dataConsulta, pesoAtual, altura, alergias, restricoesAlimentares, historicoFamiliar, observacoes, metodosUtilizados) {
    this.idCliente = idCliente;
    this.idNutricionista = idNutricionista;
    this.dataConsulta = dataConsulta;
    this.pesoAtual = pesoAtual;
    this.altura = altura;
    this.alergias = alergias;
    this.restricoesAlimentares = restricoesAlimentares;
    this.historicoFamiliar = historicoFamiliar;
    this.observacoes = observacoes;
    this.metodosUtilizados = metodosUtilizados;
  }

  toArray() {
    return [
      this.idCliente,
      this.idNutricionista,
      this.dataConsulta,
      this.pesoAtual,
      this.altura,
      this.alergias,
      this.restricoesAlimentares,
      this.historicoFamiliar,
      this.observacoes,
      this.metodosUtilizados
    ];
  }
}

export default Consulta;
