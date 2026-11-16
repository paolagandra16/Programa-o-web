let cartas = [];
let pontosJogador = 0;
let pontosComputador = 0;
let rodada = 1;
let cartaEscolhida = null;
let atributoDaRodada = null;
let cartasUsadas = [];

const atributos = ["forca", "velocidade", "defesa"];
const nomesAtributos = {
    forca: "Força",
    velocidade: "Velocidade",
    defesa: "Defesa"
};

const areaCartas = document.getElementById("cartas");
const mensagem = document.getElementById("mensagem");
const vez = document.getElementById("vez");
const areaAtributos = document.getElementById("atributos");

async function carregarCartas() {
    try {
        const resposta = await fetch("./cartas.json");
        if (!resposta.ok) {
            throw new Error("Não foi possível encontrar o cartas.json.");
        }

        cartas = await resposta.json();

        if (!Array.isArray(cartas) || cartas.length < 2) {
            throw new Error("Adicione pelo menos duas cartas no JSON.");
        }

        mostrarCartas();
        prepararRodada();
    } catch (erro) {
        console.error(erro);
        mensagem.textContent =
            "Erro ao carregar as cartas. Confira o arquivo cartas.json e abra o site pelo GitHub Pages.";
    }
}

function mostrarCartas() {
    areaCartas.innerHTML = "";

    cartas.forEach((carta, indice) => {
        const botao = document.createElement("button");
        botao.className = "carta";
        botao.type = "button";

        const imagem = document.createElement("img");
        imagem.src = carta.imagem;
        imagem.alt = carta.nome;
        imagem.onerror = () => {
            imagem.alt = "Imagem não encontrada";
            imagem.style.display = "none";
        };

        const nome = document.createElement("h3");
        nome.textContent = carta.nome;

        const forca = document.createElement("p");
        forca.textContent = "Força: " + carta.forca;

        const velocidade = document.createElement("p");
        velocidade.textContent = "Velocidade: " + carta.velocidade;

        const defesa = document.createElement("p");
        defesa.textContent = "Defesa: " + carta.defesa;

        botao.append(imagem, nome, forca, velocidade, defesa);
        botao.addEventListener("click", () => escolherCarta(indice));
        areaCartas.appendChild(botao);
    });
}

function prepararRodada() {
    cartaEscolhida = null;
    atributoDaRodada = null;
    areaAtributos.innerHTML = "";

    if (cartasUsadas.length === cartas.length) {
        cartasUsadas = [];
    }

    if (rodada % 2 === 1) {
        mensagem.textContent = "Sua vez de escolher o atributo. Primeiro, escolha uma carta.";
        vez.textContent = "Você escolhe o atributo nesta rodada.";
    } else {
        atributoDaRodada = atributos[Math.floor(Math.random() * atributos.length)];
        mensagem.textContent = "O computador escolheu o atributo: " +
            nomesAtributos[atributoDaRodada] + ". Agora escolha sua carta!";
        vez.textContent = "Vez do computador escolher o atributo.";
    }

    atualizarBotoes();
}

function atualizarBotoes() {
    const botoes = areaCartas.querySelectorAll("button");
    botoes.forEach((botao, indice) => {
        botao.disabled = cartasUsadas.includes(indice);
    });
}

function escolherCarta(indice) {
    if (cartaEscolhida !== null || cartasUsadas.includes(indice)) {
        return;
    }

    cartaEscolhida = cartas[indice];
    cartasUsadas.push(indice);

    if (rodada % 2 === 1) {
        mostrarEscolhaDeAtributo();
    } else {
        compararCartas();
    }
}

function mostrarEscolhaDeAtributo() {
    mensagem.textContent = "Você escolheu " + cartaEscolhida.nome +
        ". Agora escolha qual atributo será disputado.";

    vez.textContent = "Escolha um atributo:";
    areaAtributos.innerHTML = "";

    atributos.forEach((atributo) => {
        const botao = document.createElement("button");
        botao.className = "botao-atributo";
        botao.textContent = nomesAtributos[atributo];
        botao.addEventListener("click", () => {
            atributoDaRodada = atributo;
            compararCartas();
        });
        areaAtributos.appendChild(botao);
    });
}

function compararCartas() {
    const cartasDisponiveis = cartas
        .map((carta, indice) => ({ carta, indice }))
        .filter(item => !cartasUsadas.includes(item.indice));

    // Se não houver outra carta disponível, o computador pode usar qualquer carta.
    const opcoesComputador = cartasDisponiveis.length > 0
        ? cartasDisponiveis
        : cartas.map((carta, indice) => ({ carta, indice }));

    const sorteio = Math.floor(Math.random() * opcoesComputador.length);
    const cartaComputador = opcoesComputador[sorteio].carta;

    const valorJogador = Number(cartaEscolhida[atributoDaRodada]);
    const valorComputador = Number(cartaComputador[atributoDaRodada]);

    let resultado = "Atributo: " + nomesAtributos[atributoDaRodada] +
        "\nSua carta: " + cartaEscolhida.nome + " (" + valorJogador + ")" +
        "\nCarta do computador: " + cartaComputador.nome + " (" + valorComputador + ")\n\n";

    if (valorJogador > valorComputador) {
        pontosJogador++;
        resultado += "Você venceu esta rodada!";
    } else if (valorJogador < valorComputador) {
        pontosComputador++;
        resultado += "O computador venceu esta rodada!";
    } else {
        resultado += "Empate!";
    }

    document.getElementById("pontosJogador").textContent = pontosJogador;
    document.getElementById("pontosComputador").textContent = pontosComputador;

    mensagem.textContent = resultado;
    vez.textContent = "A próxima rodada será iniciada em seguida.";

    areaAtributos.innerHTML = "";
    rodada++;

    const botaoProxima = document.createElement("button");
    botaoProxima.className = "botao-atributo";
    botaoProxima.textContent = "Próxima rodada";
    botaoProxima.addEventListener("click", prepararRodada);
    areaAtributos.appendChild(botaoProxima);

    atualizarBotoes();
}

function reiniciarJogo() {
    pontosJogador = 0;
    pontosComputador = 0;
    rodada = 1;
    cartaEscolhida = null;
    atributoDaRodada = null;
    cartasUsadas = [];

    document.getElementById("pontosJogador").textContent = "0";
    document.getElementById("pontosComputador").textContent = "0";

    if (cartas.length > 0) {
        prepararRodada();
        atualizarBotoes();
    } else {
        carregarCartas();
    }
}

document.getElementById("reiniciar").addEventListener("click", reiniciarJogo);
carregarCartas();
