const nf  = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfi = new Intl.NumberFormat("en-US");

const app           = document.getElementById("app");

const cliente = document.getElementById("cliente");
const precio  = document.getElementById("precio");
const cuota   = document.getElementById("cuota");
const tea     = document.getElementById("tea");
const plazo   = document.getElementById("plazo");

const form   = document.getElementById("form");
const result = document.getElementById("result");
const err    = document.getElementById("err");

const outCliente   = document.getElementById("outCliente");
const cuotaMensual = document.getElementById("cuotaMensual");
const outPrecio    = document.getElementById("outPrecio");
const outCuotaPct  = document.getElementById("outCuotaPct");
const outCuota     = document.getElementById("outCuota");
const outMonto     = document.getElementById("outMonto");
const outPlazo     = document.getElementById("outPlazo");
const outTea       = document.getElementById("outTea");
const outIngreso   = document.getElementById("outIngreso");

/* ── Slideshow ── */
function initSlideshow() {
  const slides = document.querySelectorAll(".login-bg-slide");
  if (!slides.length) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, 4500);
}

/* ── Inputs ── */
function cleanNum(v) { return v.replace(/[^\d.,]/g, ""); }
function num(v) { return parseFloat((v || "").replace(/,/g, "")) || 0; }

precio.addEventListener("input",  () => { precio.value  = nfi.format(num(cleanNum(precio.value))); });
cuota.addEventListener("input",   () => { cuota.value   = cleanNum(cuota.value); });
tea.addEventListener("input",     () => { tea.value     = cleanNum(tea.value); });
plazo.addEventListener("input",   () => { plazo.value   = plazo.value.replace(/[^\d]/g, ""); });
cliente.addEventListener("input", () => { cliente.value = cliente.value.replace(/[0-9]/g, ""); });

/* ── Calcular ── */
function calcular() {
  err.textContent = "";
  const nombre = cliente.value.trim();
  const p = num(precio.value), c = num(cuota.value),
        t = num(tea.value),   a = parseInt(plazo.value, 10) || 0;

  if (!nombre || !p || !c || !t || !a) { err.textContent = "Completa todos los campos."; return; }
  if (c <= 0 || c >= 100) { err.textContent = "La cuota inicial debe ser entre 1 y 99."; return; }
  if (t <= 0) { err.textContent = "La TCEA debe ser mayor a 0."; return; }
  if (a <= 0) { err.textContent = "El plazo debe ser mayor a 0 años."; return; }

  const ci  = p * (c / 100);
  const mf  = p - ci;
  const r   = Math.pow(1 + t / 100, 1 / 12) - 1;
  const m   = a * 12;
  const cm  = mf * (r / (1 - Math.pow(1 + r, -m)));
  const ing = cm / 0.3;

  outCliente.textContent   = nombre;
  cuotaMensual.textContent = "S/ " + nf.format(cm);
  outPrecio.textContent    = "S/ " + nf.format(p);
  outCuotaPct.textContent  = c;
  outCuota.textContent     = "S/ " + nf.format(ci);
  outMonto.textContent     = "S/ " + nf.format(mf);
  outPlazo.textContent     = a + " años";
  outTea.textContent       = t + " %";
  outIngreso.textContent   = "S/ " + nf.format(ing);

  // Guardamos la simulación para el cronograma francés
  simActual = {
    nombre, precio: p, cuotaInicialPct: c, cuotaInicial: ci,
    montoFinanciado: mf, tasaMensual: r, meses: m, anios: a, tcea: t, cuotaMensual: cm,
    tabla: generarCronograma(mf, r, m, cm)
  };
  vistaAmort = "anual";

  form.classList.add("hide");
  result.classList.remove("hide");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── Reset ── */
function resetear() {
  cerrarAmortizacion();
  simActual = null;
  form.classList.remove("hide");
  result.classList.add("hide");
  cliente.value = precio.value = cuota.value = tea.value = plazo.value = "";
  err.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── Compartir ── */
function generarTexto() {
  return (
    "📊 *Propuesta de crédito Nattiva*\n\n" +
    "👤 Cliente: " + outCliente.textContent + "\n" +
    "💰 Cuota mensual: *" + cuotaMensual.textContent + "*\n\n" +
    "🏠 Precio del inmueble: " + outPrecio.textContent + "\n" +
    "📥 Cuota inicial: " + outCuota.textContent + "\n" +
    "💳 Monto a financiar: " + outMonto.textContent + "\n" +
    "📅 Plazo: " + outPlazo.textContent + "\n" +
    "📈 TCEA: " + outTea.textContent + "\n" +
    "💼 Ingreso referencial: " + outIngreso.textContent + "\n\n" +
    "_Simulación referencial sujeta a evaluación crediticia._"
  );
}

function compartirWhatsApp() {
  window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(generarTexto()), "_blank");
}
function compartirEmail() {
  window.location.href =
    "mailto:?subject=" + encodeURIComponent("Propuesta de crédito Nattiva — " + outCliente.textContent) +
    "&body=" + encodeURIComponent(generarTexto());
}
async function compartirGeneral() {
  const texto = generarTexto();
  if (navigator.share) {
    try { await navigator.share({ title: "Propuesta Nattiva", text: texto }); } catch {}
  } else {
    try { await navigator.clipboard.writeText(texto); alert("✅ Resumen copiado al portapapeles."); }
    catch { alert("Usa WhatsApp o Email para compartir."); }
  }
}

/* ══════════════════════════════════════════════
   MOTOR PDF — jsPDF vectorial
   Texto real y seleccionable, medidas exactas en
   puntos A4, paginación controlada y numeración.
   ══════════════════════════════════════════════ */

const PDF_W     = 595.28;                    // A4 ancho (pt)
const PDF_H     = 841.89;                    // A4 alto  (pt)
const PDF_M     = 40;                        // margen lateral
const PDF_CW    = PDF_W - PDF_M * 2;         // ancho útil
const PDF_FOOT  = 46;                        // alto de la banda de pie
const PDF_LIMIT = PDF_H - PDF_FOOT - 10;     // y máximo para contenido

const C = {
  navy:   [ 13,  31,  60],
  navy2:  [ 21,  42,  82],
  navyLn: [ 52,  71, 110],
  white:  [255, 255, 255],
  ghost:  [151, 164, 187],
  muted:  [107, 122, 149],
  line:   [226, 234, 244],
  soft:   [248, 250, 253],
  cream:  [250, 247, 242],
  gold:   [253, 246, 227],
  goldLn: [232, 184,  75],
  red:    [179,  32,  42],
  redBg:  [253, 232, 234],
  green:  [ 18, 140,  58],
  foot:   [244, 247, 251],
  sep:    [205, 216, 232]
};

const NOTA_PROPUESTA =
  "Esta simulación es informativa y está sujeta a evaluación crediticia, políticas internas y condiciones comerciales vigentes.";
const PIE_PROPUESTA =
  "Calculadora de Créditos Nattiva · Documento generado automáticamente, sin valor contractual.";
const NOTA_CRONOGRAMA =
  "Cronograma referencial calculado por el método francés (cuota constante). Sujeto a evaluación crediticia, políticas internas y condiciones comerciales vigentes.";

/* ── Acceso a la librería (UMD o global clásico) ── */
function jsPDFCtor() {
  if (window.jspdf && typeof window.jspdf.jsPDF === "function") return window.jspdf.jsPDF;
  if (typeof window.jsPDF === "function") return window.jsPDF;
  return null;
}

function nuevoPDF() {
  const Ctor = jsPDFCtor();
  if (!Ctor) return null;
  return new Ctor({ unit: "pt", format: "a4", orientation: "portrait", compress: true });
}

/* ── Utilidades de dibujo ── */
function fill(doc, c)   { doc.setFillColor(c[0], c[1], c[2]); }
function stroke(doc, c) { doc.setDrawColor(c[0], c[1], c[2]); }
function ink(doc, c)    { doc.setTextColor(c[0], c[1], c[2]); }

function txt(doc, s, x, y, o) {
  o = o || {};
  doc.setFont(o.font || "helvetica", o.style || "normal");
  doc.setFontSize(o.size || 10);
  ink(doc, o.color || C.navy);
  const op = {};
  if (o.align) op.align = o.align;
  if (o.cs)    op.charSpace = o.cs;
  doc.text(String(s), x, y, op);
}

function anchoTexto(doc, s, size, style, cs) {
  doc.setFont("helvetica", style || "normal");
  doc.setFontSize(size);
  let w = doc.getTextWidth(String(s));
  if (cs) w += cs * Math.max(String(s).length - 1, 0);
  return w;
}

/* Reduce el cuerpo hasta que el texto entre en maxW (evita desbordes) */
function ajustar(doc, s, maxW, size, style) {
  let sz = size;
  while (sz > 6 && anchoTexto(doc, s, sz, style) > maxW) sz -= 0.5;
  return sz;
}

function hairline(doc, x1, y, x2, c, w) {
  stroke(doc, c || C.line);
  doc.setLineWidth(w || 0.6);
  doc.line(x1, y, x2, y);
}

/* El logo se rasteriza una sola vez a data-URL: así jsPDF no necesita
   volver a pedir el archivo y un fallo de imagen nunca rompe el PDF. */
let _logoCache;
function logoPDF() {
  if (_logoCache !== undefined) return _logoCache;
  const img = document.querySelector(".result-main-logo");
  if (!img || !img.complete || !img.naturalWidth) return (_logoCache = null);
  try {
    const cv = document.createElement("canvas");
    cv.width  = img.naturalWidth;
    cv.height = img.naturalHeight;
    cv.getContext("2d").drawImage(img, 0, 0);
    _logoCache = { data: cv.toDataURL("image/png"), ratio: img.naturalWidth / img.naturalHeight };
  } catch (e) {
    _logoCache = null;
  }
  return _logoCache;
}

/* Dibuja el logo y devuelve el ancho ocupado (0 si no se pudo). */
function dibujarLogo(doc, x, y, h) {
  const l = logoPDF();
  if (!l) return 0;
  const w = h * l.ratio;
  try { doc.addImage(l.data, "PNG", x, y, w, h); return w; }
  catch (e) { return 0; }
}

function fechaPDF() {
  try {
    return new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  } catch (e) {
    return new Date().toLocaleDateString();
  }
}

/* ── Pie con nota legal + numeración (se aplica al final) ── */
function pieDePagina(doc, nota) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);

    fill(doc, C.foot);
    doc.rect(0, PDF_H - PDF_FOOT, PDF_W, PDF_FOOT, "F");
    hairline(doc, 0, PDF_H - PDF_FOOT, PDF_W, C.line, 0.6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    const lineas = doc.splitTextToSize(nota, PDF_CW - 30).slice(0, 2);
    lineas.forEach((l, k) => {
      txt(doc, l, PDF_W / 2, PDF_H - 34 + k * 9, { size: 7.2, color: C.muted, align: "center" });
    });

    txt(doc, "Generado el " + fechaPDF(), PDF_M, PDF_H - 12, { size: 7, color: C.muted });
    txt(doc, "Página " + i + " de " + total, PDF_W - PDF_M, PDF_H - 12,
        { size: 7, color: C.muted, align: "right" });
  }
}

function avisoSinLibreria() {
  alert("No se pudo iniciar el generador de PDF.\nRecarga la página e inténtalo de nuevo.");
}

/* ══════════════════════════════════════════════
   PDF 1 — PROPUESTA DE CRÉDITO (una página)
   ══════════════════════════════════════════════ */
function descargarPDF() {
  if (!simActual) { alert("Primero realiza un cálculo."); return; }

  const doc = nuevoPDF();
  if (!doc) { avisoSinLibreria(); return; }

  const s = simActual;

  doc.setProperties({
    title:   "Propuesta de crédito Nattiva - " + s.nombre,
    subject: "Simulación de crédito inmobiliario",
    author:  "Nattiva",
    creator: "Calculadora de Créditos Nattiva"
  });

  /* ── Portada ── */
  const HB = 156;
  fill(doc, C.navy); doc.rect(0, 0, PDF_W, HB, "F");
  fill(doc, C.red);  doc.rect(0, 0, PDF_W, 5, "F");

  const lwA = dibujarLogo(doc, PDF_M, 58, 40);
  const tx  = PDF_M + (lwA ? lwA + 18 : 0);
  txt(doc, "RESUMEN FINANCIERO", tx, 60, { size: 7.4, style: "bold", color: C.ghost, cs: 1.7 });
  txt(doc, "Propuesta de crédito", tx, 88, { font: "times", style: "bold", size: 24, color: C.white });
  txt(doc, "Simulación generada para evaluación preliminar", tx, 105, { size: 8.6, color: C.ghost });

  // Métrica principal
  const boxW = 186, boxX = PDF_W - PDF_M - boxW, boxY = 42, boxH = 76;
  fill(doc, C.navy2); stroke(doc, C.navyLn); doc.setLineWidth(0.8);
  doc.roundedRect(boxX, boxY, boxW, boxH, 10, 10, "FD");
  txt(doc, "CUOTA MENSUAL", boxX + boxW / 2, boxY + 21,
      { size: 6.9, style: "bold", color: C.ghost, align: "center" });
  const cuotaStr = "S/ " + nf.format(s.cuotaMensual);
  txt(doc, cuotaStr, boxX + boxW / 2, boxY + 57,
      { size: ajustar(doc, cuotaStr, boxW - 24, 21, "bold"), style: "bold", color: C.white, align: "center" });

  /* ── Cliente ── */
  fill(doc, C.cream); doc.rect(0, HB, PDF_W, 62, "F");
  hairline(doc, 0, HB + 62, PDF_W, C.line, 0.8);
  txt(doc, "CLIENTE", PDF_M, HB + 24, { size: 7.2, style: "bold", color: C.muted, cs: 1.6 });
  txt(doc, s.nombre, PDF_M, HB + 46, { font: "times", style: "bold", size: 18, color: C.navy });

  const pillTxt = "SIMULACIÓN REFERENCIAL";
  const pillW   = anchoTexto(doc, pillTxt, 7.2, "bold", 0.9) + 24;
  const pillX   = PDF_W - PDF_M - pillW, pillY = HB + 22;
  fill(doc, C.redBg); stroke(doc, C.red); doc.setLineWidth(0.6);
  doc.roundedRect(pillX, pillY, pillW, 19, 9.5, 9.5, "FD");
  txt(doc, pillTxt, pillX + 12, pillY + 12.8, { size: 7.2, style: "bold", color: C.red, cs: 0.9 });

  /* ── Tarjetas destacadas ── */
  const cY = 246, cH = 78, cW = (PDF_CW - 16) / 2;
  const tarjeta = (x, bg, borde, acento, label, valor) => {
    fill(doc, bg); stroke(doc, borde); doc.setLineWidth(0.8);
    doc.roundedRect(x, cY, cW, cH, 10, 10, "FD");
    fill(doc, acento); doc.rect(x + 1, cY + 12, 3, cH - 24, "F");
    txt(doc, label, x + 20, cY + 30, { size: 8.4, color: C.muted });
    txt(doc, valor, x + 20, cY + 58,
        { size: ajustar(doc, valor, cW - 40, 17, "bold"), style: "bold", color: C.navy });
  };
  tarjeta(PDF_M, C.gold, C.goldLn, C.goldLn,
          "Ingreso mensual referencial", "S/ " + nf.format(s.cuotaMensual / 0.3));
  tarjeta(PDF_M + cW + 16, C.soft, C.line, C.navy,
          "Monto a financiar", "S/ " + nf.format(s.montoFinanciado));

  /* ── Detalle de la operación ── */
  txt(doc, "Detalle de la operación", PDF_M, 358, { font: "times", style: "bold", size: 14, color: C.navy });
  txt(doc, "Variables consideradas en la simulación", PDF_M, 374, { size: 8.4, color: C.muted });
  hairline(doc, PDF_M, 384, PDF_M + PDF_CW, C.line, 0.8);

  const filas = [
    ["Precio del inmueble", "S/ " + nf.format(s.precio)],
    ["Cuota inicial (" + s.cuotaInicialPct + "%)", "S/ " + nf.format(s.cuotaInicial)],
    ["Plazo", s.anios + " años (" + s.meses + " cuotas)"],
    ["TCEA", s.tcea + " %"]
  ];
  const tY = 400, rH = 38;
  fill(doc, C.white); stroke(doc, C.line); doc.setLineWidth(0.8);
  doc.roundedRect(PDF_M, tY, PDF_CW, rH * filas.length, 10, 10, "FD");
  filas.forEach((f, i) => {
    const y = tY + rH * i;
    if (i % 2 === 1) { fill(doc, C.soft); doc.rect(PDF_M + 1, y, PDF_CW - 2, rH, "F"); }
    if (i > 0) hairline(doc, PDF_M + 1, y, PDF_M + PDF_CW - 1, C.line, 0.5);
    txt(doc, f[0], PDF_M + 20, y + rH / 2 + 3.5, { size: 9.4, color: C.muted });
    txt(doc, f[1], PDF_M + PDF_CW - 20, y + rH / 2 + 5,
        { size: ajustar(doc, f[1], PDF_CW / 2, 14, "bold"), style: "bold", color: C.navy, align: "right" });
  });

  /* ── Nota ── */
  const nY = tY + rH * filas.length + 34;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.2);
  const nota = doc.splitTextToSize(NOTA_PROPUESTA, PDF_CW - 44);
  const nH   = 22 + nota.length * 11;
  fill(doc, C.soft); stroke(doc, C.line); doc.setLineWidth(0.8);
  doc.roundedRect(PDF_M, nY, PDF_CW, nH, 8, 8, "FD");
  fill(doc, C.red); doc.rect(PDF_M + 1, nY + 8, 3, nH - 16, "F");
  nota.forEach((l, i) => txt(doc, l, PDF_M + 22, nY + 20 + i * 11, { size: 8.2, color: C.muted }));

  pieDePagina(doc, PIE_PROPUESTA);
  doc.save("Nattiva-Credito-" + nombreArchivo() + ".pdf");
}


/* ══════════════════════════════════════════════
   CRONOGRAMA DE AMORTIZACIÓN — MÉTODO FRANCÉS
   Cuota constante: interés = saldo × i ;
   amortización = cuota − interés ; saldo -= amortización
   ══════════════════════════════════════════════ */

let simActual  = null;
let vistaAmort = "anual";

const amortModal     = document.getElementById("amortModal");
const amortCliente   = document.getElementById("amortCliente");
const amortSummary   = document.getElementById("amortSummary");
const amortTableWrap = document.getElementById("amortTableWrap");

function generarCronograma(saldoInicial, i, meses, cuota) {
  const filas = [];
  let saldo = saldoInicial;

  for (let n = 1; n <= meses; n++) {
    const interes = saldo * i;
    let amortizacion = cuota - interes;
    let pago = cuota;

    // Última cuota: se cancela el saldo exacto (ajuste de redondeo)
    if (n === meses) { amortizacion = saldo; pago = saldo + interes; }

    const saldoFinal = Math.max(saldo - amortizacion, 0);
    filas.push({ n, saldoInicial: saldo, cuota: pago, interes, amortizacion, saldoFinal });
    saldo = saldoFinal;
  }
  return filas;
}

function agruparPorAnio(filas) {
  const anios = [];
  filas.forEach(f => {
    const idx = Math.ceil(f.n / 12) - 1;
    if (!anios[idx]) {
      anios[idx] = { n: idx + 1, saldoInicial: f.saldoInicial, cuota: 0, interes: 0, amortizacion: 0, saldoFinal: 0 };
    }
    anios[idx].cuota        += f.cuota;
    anios[idx].interes      += f.interes;
    anios[idx].amortizacion += f.amortizacion;
    anios[idx].saldoFinal    = f.saldoFinal;
  });
  return anios;
}

function totalesCronograma(filas) {
  return filas.reduce((t, f) => {
    t.pagado += f.cuota; t.interes += f.interes; return t;
  }, { pagado: 0, interes: 0 });
}

/* ── Abrir / cerrar ── */
function verAmortizacion() {
  if (!simActual) { alert("Primero realiza un cálculo."); return; }
  renderAmortizacion();
  amortModal.classList.remove("hide");
  document.body.classList.add("amort-open");
}

function cerrarAmortizacion() {
  if (!amortModal) return;
  amortModal.classList.add("hide");
  document.body.classList.remove("amort-open");
}

function cambiarVistaAmort(vista) {
  vistaAmort = vista;
  document.querySelectorAll(".amort-tab").forEach(b => {
    b.classList.toggle("active", b.dataset.vista === vista);
  });
  renderTablaAmort();
  amortTableWrap.scrollTop = 0;
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") cerrarAmortizacion();
});

/* ── Render ── */
function renderAmortizacion() {
  const s = simActual;
  const t = totalesCronograma(s.tabla);

  amortCliente.textContent =
    s.nombre + " · " + s.anios + " años (" + s.meses + " cuotas) · TCEA " + s.tcea + "%";

  amortSummary.innerHTML = `
    <div class="amort-sum-item">
      <div class="amort-sum-label">Monto financiado</div>
      <div class="amort-sum-value">S/ ${nf.format(s.montoFinanciado)}</div>
    </div>
    <div class="amort-sum-item gold">
      <div class="amort-sum-label">Cuota mensual</div>
      <div class="amort-sum-value">S/ ${nf.format(s.cuotaMensual)}</div>
    </div>
    <div class="amort-sum-item">
      <div class="amort-sum-label">Total intereses</div>
      <div class="amort-sum-value">S/ ${nf.format(t.interes)}</div>
    </div>
    <div class="amort-sum-item">
      <div class="amort-sum-label">Total a pagar</div>
      <div class="amort-sum-value">S/ ${nf.format(t.pagado)}</div>
    </div>
  `;

  renderTablaAmort();
}

function renderTablaAmort() {
  const s = simActual;
  const anual = vistaAmort === "anual";
  const filas = anual ? agruparPorAnio(s.tabla) : s.tabla;
  const t     = totalesCronograma(s.tabla);
  const etiq  = anual ? "Año" : "Cuota";

  const cuerpo = filas.map(f => `
    <tr>
      <td>${etiq} ${f.n}</td>
      <td>${nf.format(f.saldoInicial)}</td>
      <td>${nf.format(f.cuota)}</td>
      <td class="col-interes">${nf.format(f.interes)}</td>
      <td class="col-amort">${nf.format(f.amortizacion)}</td>
      <td class="col-saldo">${nf.format(f.saldoFinal)}</td>
    </tr>`).join("");

  amortTableWrap.innerHTML = `
    <table class="amort-table">
      <thead>
        <tr>
          <th>${anual ? "Periodo" : "N°"}</th>
          <th>Saldo inicial</th>
          <th>Cuota</th>
          <th>Interés</th>
          <th>Amortización</th>
          <th>Saldo final</th>
        </tr>
      </thead>
      <tbody>${cuerpo}</tbody>
      <tfoot>
        <tr>
          <td>Totales</td>
          <td>—</td>
          <td>${nf.format(t.pagado)}</td>
          <td>${nf.format(t.interes)}</td>
          <td>${nf.format(s.montoFinanciado)}</td>
          <td>0.00</td>
        </tr>
      </tfoot>
    </table>
  `;
}

/* ── Exportar CSV (abre en Excel) ── */
function descargarCronogramaCSV() {
  if (!simActual) return;
  const s = simActual;
  const t = totalesCronograma(s.tabla);

  const lineas = [
    ["Cliente", s.nombre],
    ["Precio del inmueble", s.precio.toFixed(2)],
    ["Cuota inicial (" + s.cuotaInicialPct + "%)", s.cuotaInicial.toFixed(2)],
    ["Monto financiado", s.montoFinanciado.toFixed(2)],
    ["TCEA (%)", s.tcea],
    ["Tasa efectiva mensual (%)", (s.tasaMensual * 100).toFixed(6)],
    ["Plazo (meses)", s.meses],
    ["Cuota mensual", s.cuotaMensual.toFixed(2)],
    ["Total intereses", t.interes.toFixed(2)],
    ["Total a pagar", t.pagado.toFixed(2)],
    [],
    ["N", "Saldo inicial", "Cuota", "Interes", "Amortizacion", "Saldo final"]
  ];

  s.tabla.forEach(f => lineas.push([
    f.n, f.saldoInicial.toFixed(2), f.cuota.toFixed(2),
    f.interes.toFixed(2), f.amortizacion.toFixed(2), f.saldoFinal.toFixed(2)
  ]));

  const csv = "\ufeff" + lineas.map(l => l.map(v => `"${v}"`).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = "Cronograma-" + nombreArchivo() + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

function nombreArchivo() {
  const n = (simActual && simActual.nombre) ? simActual.nombre : "Cliente";
  return n.normalize("NFD")                 // separa las tildes
          .replace(/[\u0300-\u036f]/g, "")  // y las quita (María -> Maria)
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-") || "Cliente";
}

/* ══════════════════════════════════════════════
   PDF 2 — CRONOGRAMA DE AMORTIZACIÓN
   Cabecera de tabla repetida en cada página,
   filas nunca partidas y numeración de páginas.
   ══════════════════════════════════════════════ */

const CRONO_COLS = [
  { t: "N°",           w:  40, a: "left"  },
  { t: "Saldo inicial", w:  96, a: "right" },
  { t: "Cuota",        w:  88, a: "right" },
  { t: "Interés",      w:  88, a: "right" },
  { t: "Amortización", w:  98, a: "right" },
  { t: "Saldo final",  w: 105.28, a: "right" }
];
(function posicionarColumnas() {
  let x = PDF_M;
  CRONO_COLS.forEach(c => { c.x = x; x += c.w; });
})();

const CRONO_RH = 15.5;   // alto de fila
const CRONO_HH = 22;     // alto de cabecera de tabla

function celda(doc, col, y, valor, o) {
  const der = col.a === "right";
  txt(doc, valor, der ? col.x + col.w - 8 : col.x + 8, y, Object.assign({ align: col.a }, o));
}

function cabeceraTablaCrono(doc, y) {
  fill(doc, C.foot);
  doc.rect(PDF_M, y, PDF_CW, CRONO_HH, "F");
  hairline(doc, PDF_M, y, PDF_M + PDF_CW, C.line, 0.6);
  hairline(doc, PDF_M, y + CRONO_HH, PDF_M + PDF_CW, C.navy, 1);
  CRONO_COLS.forEach(c =>
    celda(doc, c, y + 14.5, c.t, { size: 6.9, style: "bold", color: C.muted })
  );
  return y + CRONO_HH;
}

function cabeceraPaginaCrono(doc, s) {
  fill(doc, C.red); doc.rect(0, 0, PDF_W, 4, "F");
  txt(doc, "Cronograma de amortización", PDF_M, 42,
      { font: "times", style: "bold", size: 13, color: C.navy });
  txt(doc, s.nombre + " · " + s.meses + " cuotas · TCEA " + s.tcea + "%", PDF_W - PDF_M, 42,
      { size: 8, color: C.muted, align: "right" });
  hairline(doc, PDF_M, 52, PDF_M + PDF_CW, C.line, 0.6);
  return 68;
}

function descargarCronogramaPDF() {
  if (!simActual) { alert("Primero realiza un cálculo."); return; }

  const doc = nuevoPDF();
  if (!doc) { avisoSinLibreria(); return; }

  const s = simActual;
  const t = totalesCronograma(s.tabla);

  doc.setProperties({
    title:   "Cronograma de amortización - " + s.nombre,
    subject: "Método francés · cuota constante",
    author:  "Nattiva",
    creator: "Calculadora de Créditos Nattiva"
  });

  /* ── Cabecera de portada ── */
  const HB = 110;
  fill(doc, C.navy); doc.rect(0, 0, PDF_W, HB, "F");
  fill(doc, C.red);  doc.rect(0, 0, PDF_W, 5, "F");

  const lwB = dibujarLogo(doc, PDF_M, 38, 34);
  const tx  = PDF_M + (lwB ? lwB + 16 : 0);
  txt(doc, "MÉTODO FRANCÉS · CUOTA CONSTANTE", tx, 44,
      { size: 6.9, style: "bold", color: C.ghost, cs: 1.5 });
  txt(doc, "Cronograma de amortización", tx, 70,
      { font: "times", style: "bold", size: 20, color: C.white });
  txt(doc, s.nombre + " · " + s.anios + " años (" + s.meses + " cuotas) · TCEA " + s.tcea + "%", tx, 86,
      { size: 8.2, color: C.ghost });

  /* ── Resumen ── */
  const rY = 128, rH = 56, gap = 10, rW = (PDF_CW - gap * 3) / 4;
  const resumen = [
    ["MONTO FINANCIADO", "S/ " + nf.format(s.montoFinanciado), false],
    ["CUOTA MENSUAL",    "S/ " + nf.format(s.cuotaMensual),    true ],
    ["TOTAL INTERESES",  "S/ " + nf.format(t.interes),         false],
    ["TOTAL A PAGAR",    "S/ " + nf.format(t.pagado),          false]
  ];
  resumen.forEach((r, i) => {
    const x = PDF_M + (rW + gap) * i;
    fill(doc, r[2] ? C.gold : C.soft);
    stroke(doc, r[2] ? C.goldLn : C.line);
    doc.setLineWidth(0.8);
    doc.roundedRect(x, rY, rW, rH, 8, 8, "FD");
    txt(doc, r[0], x + 12, rY + 21, { size: 6.4, style: "bold", color: C.muted, cs: 0.8 });
    txt(doc, r[1], x + 12, rY + 42,
        { size: ajustar(doc, r[1], rW - 24, 12.5, "bold"), style: "bold", color: C.navy });
  });

  /* ── Tabla ── */
  let y = cabeceraTablaCrono(doc, rY + rH + 24);

  s.tabla.forEach((f, i) => {
    if (y + CRONO_RH > PDF_LIMIT) {
      doc.addPage();
      y = cabeceraTablaCrono(doc, cabeceraPaginaCrono(doc, s));
    }
    if (i % 2 === 1) { fill(doc, C.soft); doc.rect(PDF_M, y, PDF_CW, CRONO_RH, "F"); }

    const b = y + 10.4;
    celda(doc, CRONO_COLS[0], b, f.n,                       { size: 7.8, style: "bold", color: C.navy  });
    celda(doc, CRONO_COLS[1], b, nf.format(f.saldoInicial), { size: 7.8, color: C.muted });
    celda(doc, CRONO_COLS[2], b, nf.format(f.cuota),        { size: 7.8, style: "bold", color: C.navy  });
    celda(doc, CRONO_COLS[3], b, nf.format(f.interes),      { size: 7.8, color: C.red   });
    celda(doc, CRONO_COLS[4], b, nf.format(f.amortizacion), { size: 7.8, color: C.green });
    celda(doc, CRONO_COLS[5], b, nf.format(f.saldoFinal),   { size: 7.8, style: "bold", color: C.navy  });
    y += CRONO_RH;

    // Separador cada 12 cuotas (fin de año)
    if (f.n % 12 === 0 && f.n !== s.meses && y + CRONO_RH <= PDF_LIMIT) {
      hairline(doc, PDF_M, y, PDF_M + PDF_CW, C.sep, 1);
    }
  });

  /* ── Totales ── */
  if (y + 24 > PDF_LIMIT) {
    doc.addPage();
    y = cabeceraTablaCrono(doc, cabeceraPaginaCrono(doc, s));
  }
  fill(doc, C.navy); doc.rect(PDF_M, y, PDF_CW, 24, "F");
  const bt = y + 15.2, tot = { size: 7.6, style: "bold", color: C.white };
  celda(doc, CRONO_COLS[0], bt, "TOTAL",                        tot);
  celda(doc, CRONO_COLS[2], bt, nf.format(t.pagado),            tot);
  celda(doc, CRONO_COLS[3], bt, nf.format(t.interes),           tot);
  celda(doc, CRONO_COLS[4], bt, nf.format(s.montoFinanciado),   tot);
  celda(doc, CRONO_COLS[5], bt, "0.00",                         tot);

  pieDePagina(doc, NOTA_CRONOGRAMA);
  doc.save("Cronograma-" + nombreArchivo() + ".pdf");
}


/* ── Init ── */
window.addEventListener("load", () => {
  initSlideshow();
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) {
      splash.classList.add("hide");
      setTimeout(() => { splash.style.display = "none"; }, 1000);
    }
  }, 1600);
});
