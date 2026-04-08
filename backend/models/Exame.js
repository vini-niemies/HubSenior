class Exame {
  constructor(idCliente, idNutricionista, dataRealizacao, percentualGordura, massaMagra, gorduraVisceral, taxaMetabolica, colesterol, glicemiaJejum, outrosMarcadores) {
    this.idCliente = idCliente;
    this.idNutricionista = idNutricionista;
    this.dataRealizacao = dataRealizacao;
    this.percentualGordura = percentualGordura;
    this.massaMagra = massaMagra;
    this.gorduraVisceral = gorduraVisceral;
    this.taxaMetabolica = taxaMetabolica;
    this.colesterol = colesterol;
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
      this.taxaMetabolica,
      this.colesterol,
      this.glicemiaJejum,
      this.outrosMarcadores
    ];
  }
}

export default Exame;