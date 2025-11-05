// ==================================================
// --- INICIALIZAÇÃO GERAL ---
// ==================================================

// Espera o documento HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', function() {

// --- INICIALIZA O MENU HAMBÚRGUER ---
const menuToggle = document.getElementById('menu-toggle');
const nav = document.querySelector('.navegacao-principal');
if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('ativo');

        // --- LINHAS NOVAS PARA ACESSIBILIDADE ---
        const menuEstaAtivo = nav.classList.contains('ativo');
        menuToggle.setAttribute('aria-expanded', menuEstaAtivo);
        if (menuEstaAtivo) {
            menuToggle.setAttribute('aria-label', 'Fechar menu de navegação');
        } else {
            menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
        }
    
    });
}


    // --- INICIALIZA A VALIDAÇÃO DO FORMULÁRIO ---
    // (Esta função será chamada novamente sempre que o conteúdo for trocado pela SPA)
    inicializarValidacaoFormulario();
    
    // --- INICIALIZA O CARREGAMENTO DOS PROJETOS ---
    // (Esta função será chamada novamente sempre que o conteúdo for trocado pela SPA)
    carregarProjetos();

    // --- INICIALIZA O ROTEADOR SPA ---
    configurarLinksSPA(); 
});


// ==================================================
// --- FUNÇÕES DE VALIDAÇÃO ---
// ==================================================

function inicializarValidacaoFormulario() {
    const camposParaValidar = document.querySelectorAll('[required]');
    camposParaValidar.forEach(campo => {
        // Remove ouvintes antigos para evitar duplicação
        campo.removeEventListener('blur', verificaCampo);
        campo.removeEventListener('invalid', previnirValidacaoDefault);

        // Adiciona os novos ouvintes
        campo.addEventListener('blur', verificaCampo);
        campo.addEventListener('invalid', previnirValidacaoDefault);
    });
}

function verificaCampo(evento) {
    const campo = evento.target;
    let mensagem = "";

    if (campo.id === "nome" && campo.value.trim() === "") {
        mensagem = "O campo nome é obrigatório.";
    }
    if (campo.id === "cpf" && campo.value.length > 0 && !validaCPF(campo.value)) {
        mensagem = "CPF inválido. Verifique o número digitado.";
    }
    if (campo.id === "cep" && campo.value.length > 0 && !validaCEP(campo.value)) {
        mensagem = "CEP inválido. O formato deve ser 00000-000.";
    }
    if (campo.id === "telefone" && campo.value.length > 0 && !validaTelefone(campo.value)) {
        mensagem = "Telefone inválido. O formato deve ser (00) 00000-0000.";
    }

    const spanErro = document.getElementById(`erro-${campo.id}`);
    if (spanErro) {
        spanErro.textContent = mensagem;
    }
}

function previnirValidacaoDefault(evento) {
    evento.preventDefault();
}

// Funções específicas de validação de formato
function validaCPF(cpf) {
    const cpfLimpo = cpf.replace(/\.|-/g, "");
    const regexCPF = /^\d{11}$/;
    return regexCPF.test(cpfLimpo) && !/^(.)\1+$/.test(cpfLimpo);
}

function validaCEP(cep) {
    const regexCEP = /^\d{5}-?\d{3}$/;
    return regexCEP.test(cep);
}

function validaTelefone(telefone) {
    const regexTelefone = /^\(?\d{2}\)?\s?\d{5}-?\d{4}$/;
    return regexTelefone.test(telefone);
}


// ==================================================
// --- FUNÇÕES DE TEMPLATING DE PROJETOS ---
// ==================================================

const projetos = [
    {
        imagem: "imagens/mutirao.jpg",
        alt: "Voluntários atendendo a comunidade em um evento ao ar livre.",
        titulo: "Mutirão da Cidadania",
        descricao: "Periodicamente, organizamos mutirões em comunidades para oferecer orientação jurídica gratuita, auxílio na emissão de documentos e resolução de pequenas causas. É um dia de intensa mobilização social e exercício da cidadania."
    },
    {
        imagem: "imagens/escolas.jpg",
        alt: "Advogado voluntário dando uma palestra para jovens em uma sala de aula.",
        titulo: "Justiça nas Escolas",
        descricao: "Levamos palestras e oficinas para escolas públicas, ensinando noções básicas de direitos e deveres para jovens e adolescentes. Acreditamos que a educação é a principal ferramenta para a prevenção de conflitos e para a formação de cidadãos conscientes."
    },
    {
        imagem: null,
        alt: "",
        titulo: "Advocacia Pro Bono Online",
        descricao: "Através da nossa plataforma, conectamos pessoas que não podem pagar por um advogado a profissionais voluntários dispostos a doar seu tempo e conhecimento para auxiliar em casos que se enquadrem em nossos critérios de atuação."
    }
];

function criarCardProjeto(projeto) {
    const imagemHtml = projeto.imagem 
        ? `<img src="${projeto.imagem}" alt="${projeto.alt}" width="400">` 
        : '';

    return `
        <article>
            ${imagemHtml}
            <h2>${projeto.titulo}</h2>
            <p>${projeto.descricao}</p>
        </article>
    `;
}

function carregarProjetos() {
    const container = document.getElementById('container-projetos');
    if (container) {
        container.innerHTML = ''; // Limpa o container antes de adicionar novos cards
        projetos.forEach(projeto => {
            const cardHtml = criarCardProjeto(projeto);
            container.innerHTML += cardHtml;
        });
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
        document.title = novoTitulo; // Atualiza o título da aba do navegador

        // Re-inicializa as funcionalidades que dependem do novo conteúdo
        carregarProjetos();
        inicializarValidacaoFormulario();

    } catch (error) {
        console.error('Erro ao carregar a página:', error);
        container.innerHTML = '<h1>Erro ao carregar o conteúdo. Tente novamente.</h1>';
    }
}

function configurarLinksSPA() {
    const links = document.querySelectorAll('header a'); // Seleciona links do header para evitar conflitos
    links.forEach(link => {
        link.addEventListener('click', function(evento) {
            evento.preventDefault();

            const url = this.href;
            if (url !== window.location.href) { // Só carrega se a URL for diferente
                history.pushState(null, '', url);
                carregarConteudo(url);
            }
        });
    });

    // Garante que os botões de voltar/avançar do navegador funcionem
    window.addEventListener('popstate', function() {
        carregarConteudo(window.location.pathname);
    });
}
