const mensagemErroCampo = document.querySelector(".messageField");

async function criarCliente(e) {
  e.preventDefault();
  const codigo = document.getElementById("clienteCodigo").value;
  const nome = document.getElementById("clienteNome").value;
  const email = document.getElementById("clienteEmail").value;
  const senha = document.getElementById("clienteSenha").value;
  const dataNasc = document.getElementById("clienteDataNascimento").value;
  const objetivo = document.getElementById("clienteObjetivo").value;
  const endereco = document.getElementById("clienteEndereco").value;

  const user = {
    codigo,
    nome,
    email,
    senha,
    dataNasc,
    objetivo,
    endereco
  }
  const response = await fetch("http://localhost:3000/user/cliente", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-type": "application/json"
    }
  });
  const data = await response.json();
  if (data.erro) return mensagemErroCampo.textContent = data.erro;
  if (data.sucesso) {
    mensagemErroCampo.textContent = ""
    window.location.href = "../login/index.html";
    return;
  };
}

async function criarNutricionista(e) {
  e.preventDefault();
  const nome = document.getElementById("nutriNome").value;
  const crn = document.getElementById("nutriCrn").value;
  const email = document.getElementById("nutriEmail").value;
  const senha = document.getElementById("nutriSenha").value;
  const telefone = document.getElementById("nutriTelefone").value;
  const instagram = document.getElementById("nutriInstagram").value;
  const endereco = document.getElementById("nutriEndereco").value;
  const user = {
    nome,
    crn,
    email,
    senha,
    telefone,
    instagram,
    endereco
  };
  const response = await fetch("http://localhost:3000/user/nutricionista", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-type": "application/json"
    }
  });
  const data = await response.json();
  if (data.erro) return mensagemErroCampo.textContent = data.erro;
  if (data.sucesso) return window.location.href = "../login/index.html";
}

async function criarPersonal(e) {
  e.preventDefault();
  try {
    const nome = document.getElementById("persoNome").value;
    const cref = document.getElementById("persoCref").value;
    const email = document.getElementById("persoEmail").value;
    const senha = document.getElementById("persoSenha").value;
    const telefone = document.getElementById("persoTelefone").value;
    const instagram = document.getElementById("persoInstagram").value;
    const endereco = document.getElementById("persoEndereco").value;

    const user = {
      nome,
      cref,
      email,
      senha,
      telefone,
      instagram,
      endereco
    }

    const response = await fetch("http://localhost:3000/user/personal", {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-type": "application/json"
      }
    });
    const data = await response.json();
    if (data.erro) {
      console.log(data.erro);
       mensagemErroCampo.textContent = data.erro;
       return;
    }
    if (data.sucesso) {
      mensagemErroCampo.textContent = ""
      window.location.href = "../login/index.html";
      return;
    };
  } catch (error) {
    console.log(error);
  }
}

const registrarPersonalForm = document.getElementById("formPerso");
if (registrarPersonalForm) {
  registrarPersonalForm.addEventListener("submit", criarPersonal);
}

const registrarClienteForm = document.getElementById("formCliente");
if (registrarClienteForm) {
  registrarClienteForm.addEventListener("submit", criarCliente);
}

const registrarNutriForm = document.getElementById("formNutri");
if (registrarNutriForm) {
  registrarNutriForm.addEventListener("submit", criarNutricionista);
}