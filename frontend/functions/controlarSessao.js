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

  if (data.erro) {
    const responseRefresh = await fetch("http://localhost:3000/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    const dataRefresh = await responseRefresh.json();
    if (dataRefresh.erro) return (window.location.href = "../home/index.html");
    window.location.reload();
    return;
  }

  const dados = data.sucesso;
  if (!dados?.role) return (window.location.href = "../home/index.html");

  const currentPage = window.location.href.replace(/\/$/, "");
  const userRole = dados.role;
  const allowedPages = (rolePages[userRole] ?? []).map(p => p.replace(/\/$/, ""));

  const isAllowed = allowedPages.some(p => currentPage.includes(p) || p.includes(currentPage));
  
  if (!isAllowed) {
    window.location.href = roleDashboard[userRole] ?? "../home/index.html";
  }
});