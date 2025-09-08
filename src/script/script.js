// --- Estado simples ---
let editId = null;
let filtroBusca = "";
let filtroClube = "Todos";
let ordenacao = null; // "nome" | "posicao"

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
  let lista = lsGetAll();

  if (filtroBusca) {
    const q = filtroBusca.toLowerCase();
    lista = lista.filter(j => j.nome.toLowerCase().includes(q) || j.posicao.toLowerCase().includes(q));
  }


  if (filtroClube !== "Todos") {
    lista = lista.filter(j => j.clube === filtroClube);
  }

  if (ordenacao === "nome") {
    lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  } else if (ordenacao === "posicao") {
    lista.sort((a, b) => a.posicao.localeCompare(b.posicao, "pt-BR"));
  }

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
criarControles();
render();

function criarControles() {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.gap = "10px";
  container.style.flexWrap = "wrap";
  container.style.margin = "20px 0";
  container.className = "toolbar";

  // input de busca
  const inputBusca = document.createElement("input");
  inputBusca.type = "search";
  inputBusca.placeholder = "Buscar por nome ou posição";
  inputBusca.addEventListener("input", e => {
    filtroBusca = e.target.value;
    render();
  });

  // select de clubes
  const selectClube = document.createElement("select");
  const optTodos = document.createElement("option");
  optTodos.value = "Todos";
  optTodos.textContent = "Todos os clubes";
  selectClube.appendChild(optTodos);
  // popula com clubes únicos
  const clubes = [...new Set(lsGetAll().map(j => j.clube))];
  clubes.forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    selectClube.appendChild(o);
  });
  selectClube.addEventListener("change", e => {
    filtroClube = e.target.value;
    render();
  });

  // botões de ordenação
  const btnNome = document.createElement("button");
  btnNome.textContent = "Ordenar por Nome";
  btnNome.onclick = () => { ordenacao = "nome"; render(); };

  const btnPos = document.createElement("button");
  btnPos.textContent = "Ordenar por Posição";
  btnPos.onclick = () => { ordenacao = "posicao"; render(); };

  const btnLimpar = document.createElement("button");
  btnLimpar.textContent = "Limpar Ordenação";
  btnLimpar.onclick = () => { ordenacao = null; render(); };

  container.appendChild(inputBusca);
  container.appendChild(selectClube);
  container.appendChild(btnNome);
  container.appendChild(btnPos);
  container.appendChild(btnLimpar);

  // insere antes da grid
  grid.parentNode.insertBefore(container, grid);
}