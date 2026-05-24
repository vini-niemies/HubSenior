/**
 * Função para redirecionar para a página de entrada na plataforma (home)
 */
function irParaPlataforma() {
    window.location.href = '../home/index.html';
}

/**
 * Efeito de scroll suave para elementos
 */
document.addEventListener('DOMContentLoaded', function() {
    // Animação de entrada ao carregar a página
    const heroLeft = document.querySelector('.hero-left');
    const heroRight = document.querySelector('.hero-right');
    
    if (heroLeft && heroRight) {
        heroLeft.style.opacity = '0';
        heroLeft.style.transform = 'translateX(-30px)';
        heroRight.style.opacity = '0';
        heroRight.style.transform = 'translateX(30px)';

        // Trigger animations
        setTimeout(() => {
            heroLeft.style.transition = 'all 0.8s ease-out';
            heroLeft.style.opacity = '1';
            heroLeft.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            heroRight.style.transition = 'all 0.8s ease-out';
            heroRight.style.opacity = '1';
            heroRight.style.transform = 'translateX(0)';
        }, 200);
    }
});

/**
 * Verificar se o usuário já está logado
 * Se estiver, redireciona diretamente para o dashboard
 */
function verificarSessao() {
    const token = localStorage.getItem('token');
    const tipoUsuario = localStorage.getItem('tipoUsuario');
    
    if (token && tipoUsuario) {
        // Usuário já está logado, redireciona para o dashboard apropriado
        const dashboards = {
            'cliente': '../dashboards/dashboardcliente.html',
            'nutricionista': '../dashboards/dashboardnutricionista.html',
            'personal': '../dashboards/dashboardpersonal.html'
        };
        
        const dashboard = dashboards[tipoUsuario] || '../home/index.html';
        window.location.href = dashboard;
    }
}

// Executar verificação de sessão ao carregar
verificarSessao();
