class Dieta {
	constructor(idCliente, idNutricionista, dataInicio, dataFim, tituloDieta, refeicao1, refeicao2, refeicao3, refeicao4, detalhesAlimentos, objetivos) {
		this.idCliente = idCliente;
		this.idNutricionista = idNutricionista;
		this.dataInicio = dataInicio;
		this.dataFim = dataFim;
		this.tituloDieta = tituloDieta;
		this.refeicao1 = refeicao1;
		this.refeicao2 = refeicao2;
		this.refeicao3 = refeicao3;
		this.refeicao4 = refeicao4;
		this.detalhesAlimentos = detalhesAlimentos;
		this.objetivos = objetivos;
	}

	toArray() {
		return [
			this.idCliente,
			this.idNutricionista,
			this.dataInicio,
			this.dataFim,
			this.tituloDieta,
			this.refeicao1,
			this.refeicao2,
			this.refeicao3,
			this.refeicao4,
			this.detalhesAlimentos,
			this.objetivos
		];
	}
}

export default Dieta;