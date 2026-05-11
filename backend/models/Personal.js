class Personal {
    constructor(nome, cref, email, senha, telefone, codigo, instagram, endereco) {
        this.nome = nome;
        this.cref = cref;
        this.email = email;
        this.senha = senha;
        this.telefone = telefone;
        this.codigo = codigo;
        this.instagram = instagram;
        this.endereco = endereco;
    }

    toArray() {
        return [this.nome, this.cref, this.email, this.senha, this.telefone, this.codigo, this.instagram, this.endereco];
    }
}

export default Personal;