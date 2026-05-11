class Dieta {
	constructor(idCliente, idNutricionista, dataInicio, dataFim, tituloDieta, objetivos) {
		this.idCliente = idCliente;
		this.idNutricionista = idNutricionista;
		this.dataInicio = dataInicio;
		this.dataFim = dataFim;
		this.tituloDieta = tituloDieta;
		this.objetivos = objetivos;
	}

	toArray() {
		return [
			this.idCliente,
			this.idNutricionista,
			this.dataInicio,
			this.dataFim,
			this.tituloDieta,
			this.objetivos
		];
	}
}

export default Dieta;