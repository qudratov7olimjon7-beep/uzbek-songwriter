import { generateSong, songToText, toNewAlphabet } from "./generator.js";

const KEY = "uzbek-songwriter-arxiv";
const OLD_KEY = "kulgili-qoshiq-arxiv";
const VOICE_KEY = "uzbek-songwriter-ovoz";
const $ = (s) => document.querySelector(s);

const EXAMPLE_PROMPTS = ["mushugim palov yeydi", "qaynonam taksi haydaydi", "imtihon kuni telefonim öçdi",
  "Çorsu bozorida xöroz", "töyda Damas raqs tuşdi", "dadam futbol köradi"];

// Eski yozuvdagi qöşiqlarni yangi alifboga ögiradi (takror qöllansa ham ziyonsiz).
const migrate = (s) => ({ ...s, title: toNewAlphabet(s.title), verses: s.verses.map((v) => v.map(toNewAlphabet)), chorus: s.chorus.map(toNewAlphabet) });

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

// --- Ovozli ijro ---
const tts = window.speechSynthesis;
let voices = [];

function pickDefaultVoice() {
  const saved = localStorage.getItem(VOICE_KEY);
  return voices.find((v) => v.voiceURI === saved) || voices.find((v) => /^uz/i.test(v.lang))
    || voices.find((v) => /^tr/i.test(v.lang)) || voices[0];
}
function fillVoiceSelects() {
  voices = tts ? tts.getVoices() : [];
  const def = pickDefaultVoice();
  document.querySelectorAll(".voice-select").forEach((sel) => {
    sel.innerHTML = voices.map((v) => `<option value="${esc(v.voiceURI)}">${esc(v.name)} (${esc(v.lang)})</option>`).join("");
    if (def) sel.value = def.voiceURI;
    sel.disabled = !voices.length;
    sel.closest(".player").querySelector(".no-voice").hidden = voices.length > 0;
  });
}
if (tts) tts.addEventListener("voiceschanged", fillVoiceSelects);

function speak(song, player) {
  if (!tts) return toast("Brauzer ovozli öqişni qöllamaydi");
  tts.cancel();
  const voice = voices.find((v) => v.voiceURI === player.querySelector(".voice-select").value);
  const rate = Number(player.querySelector(".rate").value);
  const parts = [song.title, ...song.verses.flatMap((v) => [v.join(". "), song.chorus.join(". ")])];
  for (const text of parts) {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "uz-UZ";
    u.rate = rate;
    tts.speak(u);
  }
}

function playerHTML() {
  return `<div class="player">
    <div class="btns">
      <button type="button" class="btn play" data-act="play" aria-label="Qöşiqni ijro etiş">▶ Ijro et</button>
      <button type="button" class="btn" data-act="stop" aria-label="Ijroni töxtatiş">■ Stop</button>
    </div>
    <div class="grid">
      <div><label>Ovoz<select class="voice-select" aria-label="Ovozni tanlang"></select></label></div>
      <div><label>Tezlik: <output>1</output>×<input class="rate" type="range" min="0.5" max="1.6" step="0.1" value="1" aria-label="Öqiş tezligi"></label></div>
    </div>
    <p class="no-voice muted" hidden>Bu brauzerda ovozlar topilmadi — boşqa brauzer yoki qurilmada sinab köring.</p>
  </div>`;
}

function songHTML(s, titleId = "") {
  const parts = s.verses.map((v, i) => `<h3>${i + 1}-band</h3><p class="lines">${esc(v.join("\n"))}</p>` +
    (i === 0 ? `<h3>Naqarot</h3><p class="lines chorus">${esc(s.chorus.join("\n"))}</p>` : `<p class="muted">(Naqarot takrorlanadi)</p>`));
  return `<h2 ${titleId ? `id="${titleId}"` : ""}>${esc(s.title)}</h2>
    <p class="meta">Mavzu: «${esc(s.prompt)}» · ${fmtDate(s.date)}</p>${parts.join("")}
    <div class="row"><button type="button" class="btn" data-act="copy" aria-label="Qöşiq matnini nusxalaş">📋 Nusxalaş</button></div>
    ${playerHTML()}`;
}

// Qöşiq kartasini çizadi va tugmalarni ulaydi.
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
  container.querySelector(".voice-select").onchange = (e) => localStorage.setItem(VOICE_KEY, e.target.value);
  fillVoiceSelects();
}

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove("show"), 1800);
}
async function copy(song) {
  try { await navigator.clipboard.writeText(songToText(song)); toast("Nusxalandi ✅"); }
  catch { toast("Nusxalab bölmadi"); }
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
  const q = toNewAlphabet($("#search").value.trim().toLowerCase());
  const found = songs.filter((s) => toNewAlphabet(s.title + " " + s.prompt).toLowerCase().includes(q));
  $("#list").innerHTML = found.map((s) => `<li>
    <div><span class="t">${esc(s.title)}</span>${s.example ? '<span class="badge">namuna</span>' : ""}
      <small>«${esc(s.prompt)}» · ${fmtDate(s.date)}</small></div>
    <div class="row" style="margin:0">
      <button type="button" class="btn" data-act="open" data-id="${s.id}" aria-label="«${esc(s.title)}» qöşiğini oçiş">Oçiş</button>
      <button type="button" class="btn" data-act="copy" data-id="${s.id}" aria-label="«${esc(s.title)}» matnini nusxalaş">📋</button>
      <button type="button" class="btn danger" data-act="del" data-id="${s.id}" aria-label="«${esc(s.title)}» qöşiğini öçiriş">🗑</button>
    </div></li>`).join("");
  $("#empty").hidden = found.length > 0;
}
$("#search").addEventListener("input", renderList);
$("#list").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  const song = songs.find((s) => s.id === b.dataset.id);
  if (b.dataset.act === "open") { showSong($("#reader-body"), song, "reader-title"); $("#reader").showModal(); }
  if (b.dataset.act === "copy") copy(song);
  if (b.dataset.act === "del" && confirm(`«${song.title}» öçirilsinmi?`)) { songs = songs.filter((s) => s !== song); save(); renderList(); }
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
