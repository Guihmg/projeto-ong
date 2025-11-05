// Espera o documento HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', function() {

    // Encontra o botão do menu pelo seu ID
    const menuToggle = document.getElementById('menu-toggle');
    
    // Encontra a navegação pela sua classe
    const nav = document.querySelector('.navegacao-principal');

    // Verifica se ambos os elementos foram encontrados
    if (menuToggle && nav) {
        // Adiciona um "ouvinte de evento" de clique no botão
        menuToggle.addEventListener('click', function() {
            // A cada clique, adiciona ou remove a classe 'ativo' da navegação
            nav.classList.toggle('ativo');
        });
    }

});
