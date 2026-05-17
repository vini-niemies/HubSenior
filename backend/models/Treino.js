class Treino {
	constructor(idCliente, idPersonal, nomeTreino, diaSemana, objetivos) {
		this.idCliente = idCliente;
		this.idPersonal = idPersonal;
		this.nomeTreino = nomeTreino;
		this.diaSemana = diaSemana;
		this.objetivos = objetivos;
	}

	toArray() {
		return [
			this.idCliente,
			this.idPersonal,
			this.nomeTreino,
			this.diaSemana,
			this.objetivos
		];
	}
}

export default Treino;