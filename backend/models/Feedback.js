class Feedback {
	constructor(id_cliente, id_dieta, id_treino, texto) {
		this.id_cliente = id_cliente;
        this.id_dieta = id_dieta;
        this.id_treino = id_treino;
        this.texto = texto;
	}

	toArray() {
		return [
			this.id_cliente,
            this.id_dieta,
            this.id_treino,
            this.texto
		];
	}
}

export default Feedback;