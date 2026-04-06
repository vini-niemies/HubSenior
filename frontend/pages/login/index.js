const messageField = document.querySelector(".messageField");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const roleSelect = document.getElementById("role");
const togglePasswordBtn = document.querySelector(".toggle-password");

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
  } catch (error) {
    messageField.textContent = "Erro ao tentar realizar login";
  }
}

function togglePassword() {
  const type = senhaInput.getAttribute("type") === "password" ? "text" : "password";
  senhaInput.setAttribute("type", type);
  togglePasswordBtn.textContent = type === "password" ? "Ver" : "Ocultar";
}

const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", login);
togglePasswordBtn.addEventListener("click", togglePassword);