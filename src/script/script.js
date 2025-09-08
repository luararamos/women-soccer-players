// --- Estado simples ---
let editId = null;

// --- LocalStorage helpers ---
const lsGetAll = () => JSON.parse(localStorage.getItem(LS_KEY) || "[]");
const lsSetAll = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));
const nextId = () => {
  const n = parseInt(localStorage.getItem(LS_COUNTER) || "1", 10);
  localStorage.setItem(LS_COUNTER, String(n + 1));
  return n;
};
const seedIfEmpty = () => {
  const data = lsGetAll();
  if (data.length === 0) {
    const seeded = SEED.map((j, i) => ({ id: i + 1, ...j }));
    lsSetAll(seeded);
    localStorage.setItem(LS_COUNTER, String(seeded.length + 1));
  }
};

// --- CRUD ---
function createJogadora(j) {
  const all = lsGetAll();
  all.push({ id: nextId(), favorita: false, ...j });
  lsSetAll(all);
}
function updateJogadora(id, patch) {
  const all = lsGetAll();
  const idx = all.findIndex(x => x.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...patch };
    lsSetAll(all);
  }
}
function deleteJogadora(id) {
  const next = lsGetAll().filter(x => x.id !== id);
  lsSetAll(next);
}
function toggleFavorita(id) {
  const all = lsGetAll();
  const idx = all.findIndex(x => x.id === id);
  if (idx >= 0) {
    all[idx].favorita = !all[idx].favorita;
    lsSetAll(all);
  }
}

// --- DOM ---
const form = document.querySelector(".form-container");
const [inpNome, inpPosicao, inpClube, inpFoto, inpGols, inpAssist, inpJogos] = form.querySelectorAll("input");
const btn = form.querySelector("button");
const grid = document.querySelector(".card-grid");

const getFormData = () => ({
  nome: inpNome.value,
  posicao: inpPosicao.value,
  clube: inpClube.value,
  foto: inpFoto.value,
  gols: Number(inpGols.value),
  assistencias: Number(inpAssist.value),
  jogos: Number(inpJogos.value)
});
const setFormData = (j) => {
  inpNome.value = j?.nome || "";
  inpPosicao.value = j?.posicao || "";
  inpClube.value = j?.clube || "";
  inpFoto.value = j?.foto || "";
  inpGols.value = j?.gols ?? "";
  inpAssist.value = j?.assistencias ?? "";
  inpJogos.value = j?.jogos ?? "";
};

// --- Render  ---
function render() {
  const lista = lsGetAll();
  grid.innerHTML = "";

  lista.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const fav = document.createElement("span");
    fav.className = "favorite";
    fav.textContent = item.favorita ? "❤" : "♡";
    fav.style.cursor = "pointer";
    fav.addEventListener("click", () => { toggleFavorita(item.id); render(); });

    const img = document.createElement("img");
    img.src = item.foto;
    img.alt = "Foto jogadora";

    const h3 = document.createElement("h3");
    h3.textContent = item.nome;

    const p = document.createElement("p");
    p.textContent = `${item.posicao} - ${item.clube}`;

    const stats = document.createElement("div");
    stats.className = "stats";
    stats.innerHTML = `Gols: ${item.gols} <br> Assistências: ${item.assistencias} <br> Jogos: ${item.jogos}`;

    const actions = document.createElement("div");
    const bEdit = document.createElement("button");
    bEdit.textContent = "Editar";
    bEdit.style.marginRight = "6px";
    bEdit.addEventListener("click", () => {
      editId = item.id;
      setFormData(item);
      btn.textContent = "Salvar Edição";
    });

    const bDel = document.createElement("button");
    bDel.textContent = "Remover";
    bDel.addEventListener("click", () => { deleteJogadora(item.id); if (editId === item.id) { editId = null; btn.textContent = "Adicionar Jogadora"; setFormData({}); } render(); });

    actions.appendChild(bEdit);
    actions.appendChild(bDel);

    card.appendChild(fav);
    card.appendChild(img);
    card.appendChild(h3);
    card.appendChild(p);
    card.appendChild(stats);
    card.appendChild(actions);

    grid.appendChild(card);
  });
}

// --- Form  ---
btn.addEventListener("click", () => {
  const dados = getFormData();
  if (editId === null) {
    createJogadora(dados);
  } else {
    updateJogadora(editId, dados);
    editId = null;
    btn.textContent = "Adicionar Jogadora";
    setFormData({});
  }
  render();
});

// --- Init ---
seedIfEmpty();
render();