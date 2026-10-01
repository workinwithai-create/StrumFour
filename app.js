const CDN = "https://cdn.jsdelivr.net/gh/workinwithai-create/PreEight@main/public/samples";
const STEPS = 16;
const POCKET = 4;
const STRUM = 4;
const HOOK = 4;
const TOTAL = POCKET + STRUM + HOOK;
const recipes = [
  { id: "down-up", name: "Down-down-up", blurb: "Folk pocket. Downs on 1 and 3, up on the and of 2 and 4." },
  { id: "chuck", name: "Muted chuck", blurb: "Reggae/pop mute on 2 and 4. Open chord on 1." },
  { id: "travis", name: "Travis pocket", blurb: "Bass note then inner strings. Country-folk chair." },
  { id: "campfire", name: "Campfire holds", blurb: "Whole-note strums. Let the wood ring." },
  { id: "sixteenth", name: "16th rake", blurb: "Soft 16ths on bars 7–8 into the hook." },
  { id: "half-time", name: "Half-time wood", blurb: "One big down per bar. Space around the vocal." },
  { id: "answer", name: "Answer rake", blurb: "Bar 6 answers the melody with an upstroke figure." },
  { id: "capo-high", name: "Capo high", blurb: "Voicings an octave up so it sits above the pocket." },
  { id: "stop-hit", name: "Stop hit", blurb: "Bar 8 is one chord then air until the hook." },
  { id: "double", name: "Double guitar", blurb: "Low nylon + high nylon locked. Instant record." }
];
function bar(symbol, piano, guitar, bass) { return { symbol, piano, guitar, bass }; }
const grooves = [
  { id: "porch", name: "Porch Light", bpm: 92, key: "G major",
    pocket: [bar("G", [43,47,50,55], [43,47,50], 31), bar("Em", [40,43,47,52], [40,47,52], 28), bar("C", [36,40,43,48], [36,43,48], 36), bar("D", [38,42,45,50], [38,45,50], 26)],
    strum: [bar("G", [43,47,50,55], [43,47,50], 31), bar("Em", [40,43,47,52], [40,47,52], 28), bar("C", [36,40,43,48], [36,43,48], 36), bar("D", [38,42,45,50], [38,45,50], 26)],
    hook: [bar("G", [43,47,50,55], [43,47,50], 31), bar("C", [36,40,43,48], [36,43,48], 36), bar("Em", [40,43,47,52], [40,47,52], 28), bar("D", [38,42,45,50], [38,45,50], 26)] },
  { id: "amber", name: "Amber Wire", bpm: 100, key: "A minor",
    pocket: [bar("Am", [45,48,52,57], [45,52,57], 33), bar("F", [41,45,48,53], [41,48,53], 41), bar("C", [48,52,55,60], [48,52,55], 36), bar("G", [43,47,50,55], [43,47,50], 31)],
    strum: [bar("Am", [45,48,52,57], [45,52,57], 33), bar("F", [41,45,48,53], [41,48,53], 41), bar("C", [48,52,55,60], [48,52,55], 36), bar("G", [43,47,50,55], [43,47,50], 31)],
    hook: [bar("Am", [45,48,52,57], [45,52,57], 33), bar("G", [43,47,50,55], [43,47,50], 31), bar("F", [41,45,48,53], [41,48,53], 41), bar("E", [40,44,47,52], [40,47,52], 28)] },
  { id: "dust", name: "Dust Radio", bpm: 84, key: "D major",
    pocket: [bar("D", [38,42,45,50], [38,45,50], 26), bar("G", [43,47,50,55], [43,47,50], 31), bar("Bm", [35,38,42,47], [35,42,47], 35), bar("A", [33,37,40,45], [33,40,45], 33)],
    strum: [bar("D", [38,42,45,50], [38,45,50], 26), bar("G", [43,47,50,55], [43,47,50], 31), bar("Bm", [35,38,42,47], [35,42,47], 35), bar("A", [33,37,40,45], [33,40,45], 33)],
    hook: [bar("D", [38,42,45,50], [38,45,50], 26), bar("A", [33,37,40,45], [33,40,45], 33), bar("G", [43,47,50,55], [43,47,50], 31), bar("A", [33,37,40,45], [33,40,45], 33)] }
];
const state = { groove: grooves[0], recipe: recipes[0], playing: false, bar: 0, mode: null };
let ctx, bus, buffers = {};
async function load() {
  ctx = new AudioContext();
  bus = ctx.createGain();
  bus.gain.value = 0.38;
  bus.connect(ctx.destination);
  const files = [
    ["kick", `${CDN}/drums/kick.mp3`], ["snare", `${CDN}/drums/snare.mp3`], ["hat", `${CDN}/drums/hihat.mp3`],
    ["pC3", `${CDN}/piano/C3.mp3`], ["pC4", `${CDN}/piano/C4.mp3`], ["pA3", `${CDN}/piano/A3.mp3`],
    ["bE1", `${CDN}/bass/E1.mp3`], ["bA1", `${CDN}/bass/A1.mp3`],
    ["gE2", `${CDN}/guitar/E2.mp3`], ["gA2", `${CDN}/guitar/A2.mp3`], ["gE3", `${CDN}/guitar/E3.mp3`]
  ];
  let n = 0;
  for (const [k, url] of files) {
    try { const r = await fetch(url); buffers[k] = await ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) { console.warn(k, e); }
    n++;
    document.getElementById("status").textContent = `Seating chairs ${n}/${files.length}`;
  }
  document.getElementById("status").textContent = "Chairs seated · live FluidR3 nylon + kit";
}
function playBuf(name, when, rate = 1, gain = 0.4) {
  const b = buffers[name];
  if (!b || !ctx) return;
  const src = ctx.createBufferSource();
  src.buffer = b;
  src.playbackRate.value = rate;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(bus);
  src.start(when);
}
function rateFromMidi(midi, baseMidi) { return Math.pow(2, (midi - baseMidi) / 12); }
function chordAt(i) {
  if (i < POCKET) return state.groove.pocket[i];
  if (i < POCKET + STRUM) return state.groove.strum[i - POCKET];
  return state.groove.hook[i - POCKET - STRUM];
}
function zone(i) { if (i < POCKET) return "pocket"; if (i < POCKET + STRUM) return "strum"; return "hook"; }
function scheduleBar(barIndex, t0, stepDur) {
  const ch = chordAt(barIndex);
  const z = zone(barIndex);
  const rec = state.recipe.id;
  const onStrum = z === "strum";
  const onHook = z === "hook";
  const capo = rec === "capo-high" ? 12 : 0;
  for (let s = 0; s < STEPS; s++) {
    const when = t0 + s * stepDur;
    const stopHit = onStrum && rec === "stop-hit" && barIndex === 7 && s > 0;
    if (stopHit) continue;
    if (s % 2 === 0) playBuf("hat", when, 1, onStrum ? 0.04 : 0.06);
    if (s === 0) playBuf("kick", when, 1, onHook ? 0.55 : 0.42);
    if (s === 8) playBuf("snare", when, 1, onStrum && rec === "chuck" ? 0.22 : 0.38);
    if (s === 0) {
      playBuf("pC4", when, rateFromMidi(ch.piano[2] || 60, 60), onStrum ? 0.12 : 0.22);
      playBuf("bA1", when, rateFromMidi(ch.bass, 33), 0.36);
    }
    const gLow = ch.guitar[0] || 45;
    const gMid = ch.guitar[1] || 52;
    const gHi = ch.guitar[2] || 57;
    if (s === 0) {
      playBuf("gA2", when, rateFromMidi(gLow + capo, 45), onStrum ? 0.42 : 0.16);
      playBuf("gE3", when, rateFromMidi(gHi + capo, 52), onStrum ? 0.28 : 0.1);
      if (rec === "double" && onStrum) playBuf("gE2", when, rateFromMidi(gLow, 40), 0.3);
    }
    if (onStrum && rec === "down-up" && (s === 4 || s === 6 || s === 12 || s === 14)) {
      playBuf("gE3", when, rateFromMidi(gMid + capo, 52), s % 4 === 2 ? 0.22 : 0.16);
    }
    if (onStrum && rec === "chuck" && (s === 4 || s === 12)) {
      playBuf("gA2", when, rateFromMidi(gLow + 12, 45), 0.12);
    }
    if (onStrum && rec === "travis" && (s === 4 || s === 8 || s === 12)) {
      playBuf("gE2", when, rateFromMidi(s === 8 ? gLow : gMid, 40), 0.24);
    }
    if (onStrum && rec === "sixteenth" && barIndex >= 6 && s % 2 === 0) {
      playBuf("gE3", when, rateFromMidi(gHi + capo, 52), 0.1);
    }
    if (onStrum && rec === "half-time" && s === 8) {
      playBuf("gA2", when, rateFromMidi(gLow, 45), 0.2);
    }
    if (onStrum && rec === "answer" && barIndex === 5 && (s === 6 || s === 10 || s === 14)) {
      playBuf("gE3", when, rateFromMidi(gHi + (s === 14 ? 2 : 0), 52), 0.3);
    }
    if (onHook && s === 0) {
      playBuf("gA2", when, rateFromMidi(gLow, 45), 0.3);
      playBuf("gE3", when, rateFromMidi(gHi, 52), 0.2);
    }
    if (onHook && rec === "down-up" && (s === 6 || s === 14)) {
      playBuf("gE3", when, rateFromMidi(gMid, 52), 0.16);
    }
  }
}
let timer = null;
function stop() { state.playing = false; state.mode = null; if (timer) clearTimeout(timer); timer = null; paintBars(); }
async function play(mode) {
  if (!ctx) await load();
  if (ctx.state === "suspended") await ctx.resume();
  stop();
  state.playing = true;
  state.mode = mode;
  const startBar = mode === "eight" ? POCKET : 0;
  const endBar = mode === "loop" ? POCKET : TOTAL;
  const stepDur = 60 / state.groove.bpm / 4;
  let barIndex = startBar;
  const tick = () => {
    if (!state.playing) return;
    if (barIndex >= endBar) { if (mode === "loop") barIndex = startBar; else { stop(); return; } }
    state.bar = barIndex;
    paintBars();
    scheduleBar(barIndex, ctx.currentTime + 0.02, stepDur);
    barIndex += 1;
    timer = setTimeout(tick, STEPS * stepDur * 1000);
  };
  tick();
}
function punch() {
  const g = state.groove, r = state.recipe;
  return `StrumFour punch list\n${g.name} · ${g.bpm} BPM · ${g.key} · ${r.name}\n\nThe problem: the loop is programmed. Nobody is sitting in the guitar chair. The song sounds finished in MIDI and empty in the room.\nThe move: ${r.blurb}\n\nPocket (bars 1-4)\n${g.pocket.map((b, i) => `  ${i + 1}. ${b.symbol}`).join("\\n")}\n\nStrum chair (bars 5-8) — ${r.name}\n${g.strum.map((b, i) => `  ${i + 5}. ${b.symbol}`).join("\\n")}\n\nHook with wood (bars 9-12)\n${g.hook.map((b, i) => `  ${i + 9}. ${b.symbol}`).join("\\n")}\n\nLive chairs only. Distinct from BreathFour, AmenFour, TagFour, LeadFour, GlockFour.\nDrop the WAV on bars 5-8. Do not paste a synth pad where wood should sit.`;
}
function paintGrooves() {
  const el = document.getElementById("grooves");
  el.innerHTML = "";
  grooves.forEach(g => {
    const b = document.createElement("button");
    b.className = "card" + (state.groove.id === g.id ? " on" : "");
    b.innerHTML = `<b>${g.name}</b><span>${g.bpm} BPM · ${g.key}</span>`;
    b.onclick = () => { state.groove = g; render(); };
    el.appendChild(b);
  });
}
function paintRecipes() {
  const el = document.getElementById("recipes");
  el.innerHTML = "";
  recipes.forEach(r => {
    const b = document.createElement("button");
    b.className = "card" + (state.recipe.id === r.id ? " on" : "");
    b.innerHTML = `<b>${r.name}</b><span>${r.blurb}</span>`;
    b.onclick = () => { state.recipe = r; render(); };
    el.appendChild(b);
  });
}
function paintBars() {
  const el = document.getElementById("bars");
  el.innerHTML = "";
  for (let i = 0; i < TOTAL; i++) {
    const ch = chordAt(i);
    const z = zone(i);
    const d = document.createElement("div");
    d.className = "bar " + z + (state.playing && state.bar === i ? " active" : "");
    const label = z === "pocket" ? "P" : z === "strum" ? "S" : "H";
    d.innerHTML = `<div class="n">${i + 1} · ${label}</div><div class="c">${ch.symbol}</div>`;
    el.appendChild(d);
  }
}
function render() { paintGrooves(); paintRecipes(); paintBars(); document.getElementById("punch").textContent = punch(); }
document.getElementById("playA").onclick = () => play("loop");
document.getElementById("playB").onclick = () => play("cut");
document.getElementById("play8").onclick = () => play("eight");
document.getElementById("stop").onclick = stop;
document.getElementById("copy").onclick = () => navigator.clipboard.writeText(punch());
render();
load();
