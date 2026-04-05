const form = document.getElementById("loginForm");
const messageField = document.getElementById("messageField");
const loading = document.getElementById("loading");

function showMessage(message, isError = true) {
  if (!messageField) return;
  messageField.textContent = message;
  messageField.style.color = isError ? "#b91c1c" : "#166534";
  messageField.classList.add("show");
}

function hideMessage() {
  if (messageField) {
    messageField.classList.remove("show");
  }
}

function showLoading(show = true) {
  if (loading) {
    loading.style.display = show ? "block" : "none";
  }
}

function getTrimmedValue(id) {
  const element = document.getElementById(id);
  if (!element) return "";
  return element.value.trim();
}

async function fazerLogin(event) {
  event.preventDefault();
  hideMessage();

  const role = getTrimmedValue("role");
  const email = getTrimmedValue("email");
  const senha = getTrimmedValue("senha");

  if (!role || !email || !senha) {
    showMessage("Preencha todos os campos obrigatórios.");
    return;
  }

  if (!email.includes("@")) {
    showMessage("Email inválido.");
    return;
  }

  if (senha.length < 5) {
    showMessage("Senha deve conter pelo menos 5 caracteres.");
    return;
  }

  showLoading(true);

  try {
    const req = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        role,
        email,
        senha
      })
    });

    const response = await req.json();

    if (!req.ok || response.erro) {
      showMessage(response.erro || "Erro ao fazer login. Verifique suas credenciais.");
      showLoading(false);
      return;
    }

    showMessage(`Login realizado com sucesso!`, false);
    showLoading(false);
    form.reset();

  } catch (error) {
    console.error("Erro:", error);
    showMessage("Não foi possível conectar ao servidor. Verifique sua conexão.");
    showLoading(false);
  }
}

if (form) {
  form.addEventListener("submit", fazerLogin);
} else {
  console.warn("Formulário de login não encontrado (id esperado: loginForm).");
}

// Clear any previous messages on page load
document.addEventListener("DOMContentLoaded", () => {
  hideMessage();
  showLoading(false);
});
