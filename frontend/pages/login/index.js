const messageField = document.querySelector(".messageField");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const roleSelect = document.getElementById("role");

let logado = false;

const senhaToggle = document.getElementById("toggleSenha");
senhaToggle.addEventListener("click", () => {
  senhaInput.setAttribute("type", senhaInput.getAttribute("type") === "password" ? "text" : "password");
});

const deslogarBtn = document.getElementById("deslogarBtn");
deslogarBtn.style.display = logado === true ? "block" : "none";

async function login(e) {
  e.preventDefault();
  const user = {
    role: roleSelect.value,
    email: emailInput.value,
    senha: senhaInput.value
  }
  try {
    const req = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-type": "application/json"
      },
      credentials: "include"
    });
    const response = await req.json();
    if (response.erro) return messageField.textContent = response.erro;
    alert(response.sucesso);
    logado = true;
    deslogarBtn.style.display = logado === true ? "block" : "none";
  } catch (error) {
    messageField.textContent = "Erro ao tentar realizar login";
  }
}

async function deslogar(e) {
  e.preventDefault();
  try {
    const response = await fetch("http://localhost:3000/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    if (data.erro) return messageField.textContent = response.erro;
    if (data.sucesso) {
      logado = false;
      window.location.href = "..//home/index.html";
    }
  } catch (error) {
    messageField.textContent = "Erro ao tentar realizar login";
  }
}

const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", login);

deslogarBtn.addEventListener("click", deslogar);