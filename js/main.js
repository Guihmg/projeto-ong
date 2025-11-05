// ==================================================
// --- INICIALIZAÇÃO GERAL ---
// ==================================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa funcionalidades da página inicial
    inicializarComponentes();
    // Configura os links da SPA
    configurarLinksSPA();
});

function inicializarComponentes() {
    // --- INICIALIZA O MENU HAMBÚRGUER ---
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('.navegacao-principal');
    if (menuToggle && nav) {
        // Garante que o evento não seja adicionado múltiplas vezes
        if (!menuToggle.dataset.listenerAdicionado) {
            menuToggle.addEventListener('click', function() {
                nav.classList.toggle('ativo');
                const menuEstaAtivo = nav.classList.contains('ativo');
                menuToggle.setAttribute('aria-expanded', menuEstaAtivo);
                menuToggle.setAttribute('aria-label', menuEstaAtivo ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
            });
            menuToggle.dataset.listenerAdicionado = 'true';
        }
    }

    // --- INICIALIZA A VALIDAÇÃO DO FORMULÁRIO ---
    inicializarValidacaoFormulario();
    
    // --- INICIALIZA O CARREGAMENTO DOS PROJETOS ---
    carregarProjetos();
}

// ==================================================
// --- FUNÇÕES DE VALIDAÇÃO ---
// ==================================================

function inicializarValidacaoFormulario() {
    const camposParaValidar = document.querySelectorAll('[required]');
    camposParaValidar.forEach(campo => {
        campo.addEventListener('blur', verificaCampo);
        campo.addEventListener('invalid', previnirValidacaoDefault);
    });
}

function verificaCampo(evento) {
    const campo = evento.target;
    let mensagem = "";
    if (campo.id === "nome" && campo.value.trim() === "") mensagem = "O campo nome é obrigatório.";
    if (campo.id === "cpf" && campo.value.length > 0 && !validaCPF(campo.value)) mensagem = "CPF inválido. Verifique o número digitado.";
    if (campo.id === "cep" && campo.value.length > 0 && !validaCEP(campo.value)) mensagem = "CEP inválido. O formato deve ser 00000-000.";
    if (campo.id === "telefone" && campo.value.length > 0 && !validaTelefone(campo.value)) mensagem = "Telefone inválido. O formato deve ser (00) 00000-0000.";
    const spanErro = document.getElementById(`erro-${campo.id}`);
    if (spanErro) spanErro.textContent = mensagem;
}

function previnirValidacaoDefault(evento) { evento.preventDefault(); }
function validaCPF(cpf) { const c = cpf.replace(/\D/g, ''); return c.length === 11 && !/^(.)\1+$/.test(c); }
function validaCEP(cep) { return /^\d{5}-?\d{3}$/.test(cep); }
function validaTelefone(tel) { return /^\(?\d{2}\)?\s?\d{5}-?\d{4}$/.test(tel); }

// ==================================================
// --- FUNÇÕES DE TEMPLATING DE PROJETOS ---
// ==================================================

const projetos = [
    { imagem: "imagens/mutirao.jpg", alt: "Voluntários atendendo a comunidade", titulo: "Mutirão da Cidadania", descricao: "Periodicamente, organizamos mutirões para oferecer orientação jurídica gratuita, emissão de documentos e resolução de pequenas causas." },
    { imagem: "imagens/escolas.jpg", alt: "Advogado dando palestra para jovens", titulo: "Justiça nas Escolas", descricao: "Levamos palestras e oficinas para escolas públicas, ensinando noções básicas de direitos e deveres para jovens e adolescentes." },
    { imagem: null, alt: "", titulo: "Advocacia Pro Bono Online", descricao: "Conectamos pessoas que não podem pagar por um advogado a profissionais voluntários dispostos a doar seu tempo e conhecimento." }
];

function criarCardProjeto(p) {
    const img = p.imagem ? `<img src="${p.imagem}" alt="${p.alt}" width="400">` : '';
    return `<article>${img}<h2>${p.titulo}</h2><p>${p.descricao}</p></article>`;
}

function carregarProjetos() {
    const container = document.getElementById('container-projetos');
    if (container) {
        container.innerHTML = '';
        projetos.forEach(p => container.innerHTML += criarCardProjeto(p));
    }
}

// ==================================================
// --- ROTEADOR SPA (SINGLE PAGE APPLICATION) ---
// ==================================================

async function carregarConteudo(url) {
    const container = document.getElementById('conteudo-dinamico');
    try {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const novoConteudo = doc.querySelector('.conteudo-principal').innerHTML;
        const novoTitulo = doc.querySelector('title').textContent;
        container.innerHTML = novoConteudo;
        document.title = novoTitulo;
        // Re-inicializa os componentes que podem existir no novo conteúdo
        inicializarComponentes();
    } catch (error) {
        console.error('Erro ao carregar a página:', error);
        container.innerHTML = '<h1>Erro ao carregar o conteúdo.</h1>';
    }
}


function configurarLinksSPA() {
    document.body.addEventListener('click', function(evento) {
        const link = evento.target.closest('header a');
        if (link) {
            evento.preventDefault();
            const url = link.href;
            if (url !== window.location.href) {
                history.pushState(null, '', url);
                carregarConteudo(url);
            }
        }
    });

    window.addEventListener('popstate', function() {
        carregarConteudo(window.location.pathname);
    });
}

