async function criarCliente(e) {
  e.preventDefault();
  const codigo = document.getElementById("clienteCodigo").value;
  const nome = document.getElementById("clienteNome").value;
  const email = document.getElementById("clienteEmail").value;
  const senha = document.getElementById("clienteSenha").value;
  const dataNasc = document.getElementById("clienteDataNascimento").value;
  const objetivo = document.getElementById("clienteObjetivo").value;
  const endereco = document.getElementById("clienteEndereco").value;
  const email2 = document.getElementById("clienteEmail2").value;

  const user = {
    codigo,
    nome,
    email,
    senha,
    dataNasc,
    objetivo,
    endereco,
    email2
  }

  console.log(user)
  const response = await fetch("http://localhost:3000/user/cliente", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-type": "application/json"
    }
  });

  const data = await response.json();
  if (data.erro) return console.log(data.erro);
  if (data.sucesso) return window.location.href = "../login/index.html";
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
  if (data.erro) return console.log(data.erro);
  if (data.sucesso) return window.location.href = "../login/index.html";
}

const registrarClienteForm = document.getElementById("formCliente");
if (registrarClienteForm) {
  registrarClienteForm.addEventListener("submit", criarCliente);
}

const registrarNutriForm = document.getElementById("formNutri");
if (registrarNutriForm) {
  registrarNutriForm.addEventListener("submit", criarNutricionista);
}