import { generateSong, songToText, toStandardLatin } from "./generator.js";

const KEY = "uzbek-songwriter-arxiv";
const OLD_KEY = "kulgili-qoshiq-arxiv";
const $ = (s) => document.querySelector(s);

const EXAMPLE_PROMPTS = ["mushugim palov yeydi", "qaynonam taksi haydaydi", "imtihon kuni telefonim oʻchdi",
  "Chorsu bozorida xoʻroz", "toʻyda Damas raqs tushdi", "dadam futbol koʻradi"];

// Yangi alifbodagi (ö, ğ, ş, ç) eski saqlangan qoʻshiqlarni joriy lotin yozuviga qaytaradi (takror qoʻllansa ham ziyonsiz).
const migrate = (s) => ({ ...s, title: toStandardLatin(s.title), verses: s.verses.map((v) => v.map(toStandardLatin)), chorus: s.chorus.map(toStandardLatin) });

function load() {
  const raw = localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY);
  const list = raw ? JSON.parse(raw).map(migrate)
    : EXAMPLE_PROMPTS.map((p, i) => ({ ...generateSong(p), id: "namuna-" + i, date: Date.now() - (i + 1) * 864e5, example: true }));
  localStorage.setItem(KEY, JSON.stringify(list));
  localStorage.removeItem(OLD_KEY);
  return list;
}
let songs = load();
const save = () => localStorage.setItem(KEY, JSON.stringify(songs));

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const OYLAR = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const fmtDate = (t) => {
  const d = new Date(t), pad = (n) => String(n).padStart(2, "0");
  return `${d.getDate()}-${OYLAR[d.getMonth()]}, ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// --- Ovozli ijro: faqat oʻzbekcha ovozlar ---
const tts = window.speechSynthesis;
const GENDER_KEY = "uzbek-songwriter-ovoz";
const MALE = /sardor|male|erkak/i, FEMALE = /madina|female|ayol/i;
let uzVoices = { erkak: null, ayol: null };

function findUzVoices() {
  const list = tts ? tts.getVoices().filter((v) => /^uz/i.test(v.lang)) : [];
  const ayol = list.find((v) => FEMALE.test(v.name)) || null;
  const erkak = list.find((v) => MALE.test(v.name) && !FEMALE.test(v.name)) || list.find((v) => v !== ayol) || null;
  uzVoices = { erkak, ayol: ayol || (erkak ? null : list[0] || null) };
}
function chosenGender() {
  const saved = localStorage.getItem(GENDER_KEY);
  if (uzVoices[saved]) return saved;
  return uzVoices.erkak ? "erkak" : "ayol";
}
function updatePlayers() {
  findUzVoices();
  const any = uzVoices.erkak || uzVoices.ayol;
  const g = chosenGender();
  document.querySelectorAll(".player").forEach((pl) => {
    pl.querySelector(".play").disabled = !any;
    pl.querySelectorAll("input[name^=ovoz]").forEach((r) => {
      r.disabled = !uzVoices[r.value];
      r.checked = r.value === g && !!any;
    });
    const note = pl.querySelector(".voice-note");
    if (!any) note.textContent = "Bu brauzerda oʻzbekcha ovoz topilmadi. Oʻzbekcha ovozlar Microsoft Edge brauzerida (kompyuter va Android) mavjud — saytni oʻsha yerda oching.";
    else if (!uzVoices.erkak || !uzVoices.ayol) note.textContent = `Bu brauzerda faqat ${uzVoices.erkak ? "erkak" : "ayol"} ovozi bor.`;
    else note.textContent = "";
    note.hidden = !note.textContent;
  });
}
if (tts) tts.addEventListener("voiceschanged", updatePlayers);

function speak(song, player) {
  const voice = uzVoices[player.querySelector("input[name^=ovoz]:checked")?.value];
  if (!tts || !voice) return;
  tts.cancel();
  const rate = Number(player.querySelector(".rate").value);
  const parts = [song.title, ...song.verses.flatMap((v) => [v.join(". "), song.chorus.join(". ")])];
  for (const text of parts) {
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = "uz-UZ";
    u.rate = rate;
    tts.speak(u);
  }
}

let playerCount = 0;
function playerHTML() {
  const n = ++playerCount;
  return `<div class="player">
    <div class="btns">
      <button type="button" class="btn play" data-act="play" aria-label="Qoʻshiqni ijro etish">▶ Ijro et</button>
      <button type="button" class="btn" data-act="stop" aria-label="Ijroni toʻxtatish">■ Stop</button>
    </div>
    <div class="grid">
      <fieldset class="toggle"><legend>Ovoz</legend>
        <label><input type="radio" name="ovoz${n}" value="erkak"> Erkak</label>
        <label><input type="radio" name="ovoz${n}" value="ayol"> Ayol</label>
      </fieldset>
      <div><label>Tezlik: <output>1</output>×<input class="rate" type="range" min="0.5" max="1.6" step="0.1" value="1" aria-label="Oʻqish tezligi"></label></div>
    </div>
    <p class="voice-note muted" role="status" hidden></p>
  </div>`;
}

function songHTML(s, titleId = "") {
  const parts = s.verses.map((v, i) => `<h3>${i + 1}-band</h3><p class="lines">${esc(v.join("\n"))}</p>` +
    (i === 0 ? `<h3>Naqarot</h3><p class="lines chorus">${esc(s.chorus.join("\n"))}</p>` : `<p class="muted">(Naqarot takrorlanadi)</p>`));
  return `<h2 ${titleId ? `id="${titleId}"` : ""}>${esc(s.title)}</h2>
    <p class="meta">Mavzu: «${esc(s.prompt)}» · ${fmtDate(s.date)}</p>${parts.join("")}
    <div class="row"><button type="button" class="btn" data-act="copy" aria-label="Qoʻshiq matnini nusxalash">📋 Nusxalash</button></div>
    ${playerHTML()}`;
}

// Qoʻshiq kartasini chizadi va tugmalarni ulaydi.
function showSong(container, song, titleId) {
  container.innerHTML = songHTML(song, titleId);
  container.onclick = (e) => {
    const act = e.target.closest("button")?.dataset.act;
    if (act === "copy") copy(song);
    if (act === "play") speak(song, container.querySelector(".player"));
    if (act === "stop") tts?.cancel();
  };
  const rate = container.querySelector(".rate");
  rate.oninput = () => (rate.previousElementSibling.textContent = rate.value);
  container.querySelectorAll("input[name^=ovoz]").forEach((r) => (r.onchange = () => localStorage.setItem(GENDER_KEY, r.value)));
  updatePlayers();
}

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove("show"), 1800);
}
async function copy(song) {
  try { await navigator.clipboard.writeText(songToText(song)); toast("Nusxalandi ✅"); }
  catch { toast("Nusxalab boʻlmadi"); }
}

// Generator
$("#gen-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const song = { ...generateSong($("#prompt").value), id: crypto.randomUUID(), date: Date.now() };
  songs.unshift(song); save();
  const r = $("#result");
  showSong(r, song);
  r.insertAdjacentHTML("afterbegin", `<p class="muted" style="margin:0 0 .5rem">Arxivga saqlandi ✔</p>`);
  r.hidden = false;
  renderList();
});
document.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => { $("#prompt").value = c.textContent; $("#prompt").focus(); }));

// Arxiv
function renderList() {
  const q = toStandardLatin($("#search").value.trim().toLowerCase());
  const found = songs.filter((s) => toStandardLatin(s.title + " " + s.prompt).toLowerCase().includes(q));
  $("#list").innerHTML = found.map((s) => `<li>
    <div><span class="t">${esc(s.title)}</span>${s.example ? '<span class="badge">namuna</span>' : ""}
      <small>«${esc(s.prompt)}» · ${fmtDate(s.date)}</small></div>
    <div class="row" style="margin:0">
      <button type="button" class="btn" data-act="open" data-id="${s.id}" aria-label="«${esc(s.title)}» qoʻshigʻini ochish">Ochish</button>
      <button type="button" class="btn" data-act="copy" data-id="${s.id}" aria-label="«${esc(s.title)}» matnini nusxalash">📋</button>
      <button type="button" class="btn danger" data-act="del" data-id="${s.id}" aria-label="«${esc(s.title)}» qoʻshigʻini oʻchirish">🗑</button>
    </div></li>`).join("");
  $("#empty").hidden = found.length > 0;
}
$("#search").addEventListener("input", renderList);
$("#list").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  const song = songs.find((s) => s.id === b.dataset.id);
  if (b.dataset.act === "open") { showSong($("#reader-body"), song, "reader-title"); $("#reader").showModal(); }
  if (b.dataset.act === "copy") copy(song);
  if (b.dataset.act === "del" && confirm(`«${song.title}» oʻchirilsinmi?`)) { songs = songs.filter((s) => s !== song); save(); renderList(); }
});
$("#reader-close").onclick = () => $("#reader").close();
$("#reader").addEventListener("close", () => tts?.cancel());

// Sahifalar (hash orqali)
function route() {
  const tab = location.hash === "#arxiv" ? "arxiv" : "yarat";
  $("#view-yarat").hidden = tab !== "yarat";
  $("#view-arxiv").hidden = tab !== "arxiv";
  document.querySelectorAll("nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.tab === tab);
    a.toggleAttribute("aria-current", a.dataset.tab === tab);
  });
}
addEventListener("hashchange", route);
route(); renderList();
