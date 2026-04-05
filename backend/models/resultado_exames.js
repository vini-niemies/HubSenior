class ResultadoExames {
  constructor(
    idCliente,
    idNutricionista,
    dataRealizacao,
    percentualGordura,
    massaMagra,
    gorduraVisceral,
    taxaMetabolicaBasal,
    colesterolTotal,
    glicemiaJejum,
    outrosMarcadores
  ) {
    this.idCliente = idCliente;
    this.idNutricionista = idNutricionista;
    this.dataRealizacao = dataRealizacao;
    this.percentualGordura = percentualGordura;
    this.massaMagra = massaMagra;
    this.gorduraVisceral = gorduraVisceral;
    this.taxaMetabolicaBasal = taxaMetabolicaBasal;
    this.colesterolTotal = colesterolTotal;
    this.glicemiaJejum = glicemiaJejum;
    this.outrosMarcadores = outrosMarcadores;
  }

  toArray() {
    return [
      this.idCliente,
      this.idNutricionista,
      this.dataRealizacao,
      this.percentualGordura,
      this.massaMagra,
      this.gorduraVisceral,
      this.taxaMetabolicaBasal,
      this.colesterolTotal,
      this.glicemiaJejum,
      this.outrosMarcadores
    ];
  }
}

export default ResultadoExames;
