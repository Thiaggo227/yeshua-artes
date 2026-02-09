/* ==========================
   ELEMENTOS
========================== */

const inputEvento = document.querySelector("input");
const btnParticipante = document.querySelector(".btnPart");
const nomeEvento = document.getElementById("nomeEvento");
const palco = document.getElementById("boxPalco");

/* ==========================
   AJUSTAR ALTURA DO PALCO
========================== */

function ajustarAlturaPalco() {
    let maiorY = 0;

    palco.querySelectorAll(".participante").forEach(p => {
        const bottom = p.offsetTop + p.offsetHeight;
        if (bottom > maiorY) maiorY = bottom;
    });

    const alturaMinima = window.innerHeight * 0.65;
    palco.style.height = Math.max(maiorY + 20, alturaMinima) + "px";
}

/* ==========================
   POSIÇÃO INTELIGENTE
========================== */

function proximaPosicaoColuna() {
    const participantes = [...palco.querySelectorAll(".participante")];

    let y = 40;

    participantes
        .sort((a, b) => a.offsetTop - b.offsetTop)
        .forEach(p => {
            if (y + 5 < p.offsetTop) return;
            y = p.offsetTop + p.offsetHeight + 10;
        });

    return y;
}

/* ==========================
   LOCAL STORAGE
========================== */

function salvarFormacao() {
    const dados = [];

    palco.querySelectorAll(".participante").forEach(p => {
        dados.push({
            nome: p.querySelector("span").textContent,
            left: p.style.left,
            top: p.style.top
        });
    });

    localStorage.setItem("formacao", JSON.stringify(dados));
}

function carregarFormacao() {
    const dados = JSON.parse(localStorage.getItem("formacao"));
    if (!dados) return;

    dados.forEach(item => criarParticipante(item.nome, item.left, item.top));

    ajustarAlturaPalco();
}

/* ==========================
   CRIAR PARTICIPANTE
========================== */

function criarParticipante(nome, left = "10px", top = null) {

    const participante = document.createElement("div");
    participante.classList.add("participante");
    participante.style.position = "absolute";
    participante.style.left = left;

    const spanNome = document.createElement("span");
    spanNome.textContent = nome;

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "✖";
    btnRemover.classList.add("remover");

    btnRemover.addEventListener("click", (e) => {
        e.stopPropagation();
        participante.remove();
        ajustarAlturaPalco();
        salvarFormacao();
    });

    participante.appendChild(spanNome);
    participante.appendChild(btnRemover);

    palco.appendChild(participante);

    participante.style.top = top ?? proximaPosicaoColuna() + "px";

    ajustarAlturaPalco();
    salvarFormacao();
}

/* ==========================
   CRIAR EVENTO
========================== */

inputEvento.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && inputEvento.value.trim() !== "") {

        nomeEvento.innerHTML = "";

        const spanEvento = document.createElement("span");
        spanEvento.textContent = inputEvento.value;

        const btnRemoverEvento = document.createElement("button");
        btnRemoverEvento.textContent = "✖";
        btnRemoverEvento.classList.add("removerEvento");

        btnRemoverEvento.addEventListener("click", () => {
            nomeEvento.innerHTML = "";
            palco.querySelectorAll(".participante").forEach(p => p.remove());
            localStorage.removeItem("formacao");
            ajustarAlturaPalco();
        });

        nomeEvento.appendChild(spanEvento);
        nomeEvento.appendChild(btnRemoverEvento);

        inputEvento.value = "";
    }
});

/* ==========================
   MODAL PARTICIPANTE
========================== */

const modal = document.getElementById("modal");
const inputParticipante = document.getElementById("inputParticipante");
const btnConfirmar = document.getElementById("confirmarModal");
const btnCancelar = document.getElementById("cancelarModal");

btnParticipante.addEventListener("click", () => {
    modal.classList.add("ativo");
    inputParticipante.focus();
});

function fecharModal() {
    modal.classList.remove("ativo");
    inputParticipante.value = "";
}

btnCancelar.addEventListener("click", fecharModal);

modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
});

btnConfirmar.addEventListener("click", adicionarParticipante);

inputParticipante.addEventListener("keydown", (e) => {
    if (e.key === "Enter") adicionarParticipante();
});

function adicionarParticipante() {
    const nome = inputParticipante.value.trim();
    if (!nome) return;

    criarParticipante(nome);
    fecharModal();
}

/* ==========================
   SISTEMA DE ARRASTAR
========================== */

let arrastando = null;
let offsetX = 0;
let offsetY = 0;

function iniciarArrasto(x, y, alvo) {
    arrastando = alvo;

    const rect = arrastando.getBoundingClientRect();

    offsetX = x - rect.left;
    offsetY = y - rect.top;

    palco.appendChild(arrastando);
}

function moverArrasto(x, y) {
    if (!arrastando) return;

    const rect = palco.getBoundingClientRect();

    let posX = x - rect.left - offsetX;
    let posY = y - rect.top - offsetY;

    posX = Math.max(0, Math.min(posX, palco.clientWidth - arrastando.offsetWidth));
    posY = Math.max(0, Math.min(posY, palco.clientHeight - arrastando.offsetHeight));

    arrastando.style.left = posX + "px";
    arrastando.style.top = posY + "px";

    ajustarAlturaPalco();
}

function finalizarArrasto() {
    if (arrastando) salvarFormacao();
    arrastando = null;
}

document.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("remover")) return;

    const alvo = e.target.closest(".participante");
    if (!alvo) return;

    iniciarArrasto(e.clientX, e.clientY, alvo);
});

document.addEventListener("mousemove", (e) => {
    moverArrasto(e.clientX, e.clientY);
});

document.addEventListener("mouseup", finalizarArrasto);

document.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];

    if (e.target.classList.contains("remover")) return;

    const alvo = e.target.closest(".participante");
    if (!alvo) return;

    iniciarArrasto(touch.clientX, touch.clientY, alvo);
});

document.addEventListener("touchmove", (e) => {
    if (!arrastando) return;

    e.preventDefault();

    const touch = e.touches[0];
    moverArrasto(touch.clientX, touch.clientY);
}, { passive: false });

document.addEventListener("touchend", finalizarArrasto);

/* ==========================
   CARREGAR AO ABRIR
========================== */

carregarFormacao();
