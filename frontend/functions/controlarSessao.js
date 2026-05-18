const rolePages = {
  personal: ["http://localhost:3000/pages/treino/index.html", "http://localhost:3000/pages/dashboards/dashboardpersonal.html", "http://localhost:3000/pages/dashboards/conta.html"],
  nutricionista: ["http://localhost:3000/pages/dieta/index.html", "http://localhost:3000/pages/dashboards/dashboardnutricionista.html", "http://localhost:3000/pages/consulta/index.html", "http://localhost:3000/pages/dashboards/conta.html"],
  cliente: ["http://localhost:3000/pages/dashboards/dashboardcliente.html", "http://localhost:3000/pages/dashboards/conta.html"],
};

const roleDashboard = {
  personal: "http://localhost:3000/pages/dashboards/dashboardpersonal.html",
  nutricionista: "http://localhost:3000/pages/dashboards/dashboardnutricionista.html",
  cliente: "http://localhost:3000/pages/dashboards/dashboardcliente.html",
};

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("http://localhost:3000/auth/me", {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();

  const currentPage = window.location.href.replace(/\/$/, "");

  if (data.erro) {
    const responseRefresh = await fetch("http://localhost:3000/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    const dataRefresh = await responseRefresh.json();
    if (dataRefresh.erro) {
      if (!currentPage.includes("home/index.html") && !currentPage.includes("login/index.html") && !currentPage.includes("registro/")) {
        window.location.href = "http://localhost:3000/pages/home/index.html";
      }
      return;
    }
    window.location.reload();
    return;
  }

  const dados = data.sucesso;
  if (!dados?.role) {
    if (!currentPage.includes("home/index.html") && !currentPage.includes("login/index.html") && !currentPage.includes("registro/")) {
      window.location.href = "http://localhost:3000/pages/home/index.html";
    }
    return;
  }

  const userRole = dados.role;

  // Se já estiver logado e tentar acessar home, login ou registro, redireciona pro dashboard
  if (currentPage.includes("home/index.html") || currentPage.includes("login/index.html") || currentPage.includes("registro/")) {
    window.location.href = roleDashboard[userRole] ?? "http://localhost:3000/pages/home/index.html";
    return;
  }

  const allowedPages = (rolePages[userRole] ?? []).map(p => p.replace(/\/$/, ""));

  const isAllowed = allowedPages.some(p => currentPage.includes(p) || p.includes(currentPage));
  
  if (!isAllowed) {
    window.location.href = roleDashboard[userRole] ?? "http://localhost:3000/pages/home/index.html";
  }
});