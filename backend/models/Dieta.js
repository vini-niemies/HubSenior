class Dieta {
	constructor(idCliente, idNutricionista, dataInicio, dataFim, tituloDieta, objetivos, observacoesGerais) {
		this.idCliente = idCliente;
		this.idNutricionista = idNutricionista;
		this.dataInicio = dataInicio;
		this.dataFim = dataFim;
		this.tituloDieta = tituloDieta;
		this.objetivos = objetivos;
		this.observacoesGerais = observacoesGerais;
	}

	toArray() {
		return [
			this.idCliente,
			this.idNutricionista,
			this.dataInicio,
			this.dataFim,
			this.tituloDieta,
			this.objetivos,
			this.observacoesGerais
		];
	}
}

export default Dieta;