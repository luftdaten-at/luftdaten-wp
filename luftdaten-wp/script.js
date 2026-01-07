// --------------------------
// DEBUG MODE
// --------------------------
// Check if debug mode is enabled (passed from PHP via wp_localize_script)
const DEBUG_MODE = (typeof luftdatenDebug !== 'undefined' && luftdatenDebug.enabled === true);

// Debug logging function that only logs if debug mode is enabled
function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log(...args);
    }
}

function debugWarn(...args) {
    if (DEBUG_MODE) {
        console.warn(...args);
    }
}

function debugError(...args) {
    if (DEBUG_MODE) {
        console.error(...args);
    }
}

// --------------------------
// MOCK DATA (replace with fetch("/api/..."))
// --------------------------
const years = d3.range(2005, 2026);
const last = arr => arr[arr.length - 1];

function series(base, slope, noise=1.2, min=0){
  let v = base;
  return years.map((y,i) => {
    v = Math.max(min, v + slope + (Math.random()-0.5)*noise);
    return { year:y, value:+v.toFixed(1) };
  });
}

const pm25_annual = series(14.5, -0.25, 1.1, 4);
const no2_traffic = series(48, -0.9, 2.4, 8);
const no2_background = series(22, -0.4, 1.5, 5);
const o3_episode_days = years.map((y,i)=>({ year:y, value: Math.max(0, Math.round(8 + 6*Math.sin(i/2.2) + (Math.random()-0.5)*6)) }));
const pm10_high_days  = years.map((y,i)=>({ year:y, value: Math.max(0, Math.round(22 + 5*Math.sin(i/1.9) + (Math.random()-0.5)*8)) }));

const m2_pairs = d3.range(180).map(i => {
  const tmax = 20 + Math.random()*16;
  const o3 = 80 + (tmax - 20) * (4 + Math.random()*2) + (Math.random()-0.5)*25;
  return { tmax:+tmax.toFixed(1), o3:+o3.toFixed(1) };
});

const m3_tropical_nights_city = years.map((y,i)=>({ year:y, value: Math.max(0, Math.round(4 + 0.45*i + (Math.random()-0.5)*5)) }));
const m3_tropical_nights_rural = years.map((y,i)=>({ year:y, value: Math.max(0, Math.round(1 + 0.22*i + (Math.random()-0.5)*3)) }));
const m3_uhi_delta = years.map((y,i)=>({ year:y, value: +(0.8 + 0.03*i + (Math.random()-0.5)*0.25).toFixed(2) }));

const m4_double_days = years.map((y,i)=>{
  const base = Math.max(0, Math.round(4 + 0.35*i + 3*Math.sin(i/3) + (Math.random()-0.5)*4));
  return { year:y, value: base };
});

const m5_actions = [
  { action:"Grün-/Blau-Infrastruktur", heat:2, air:1 },
  { action:"Entsiegelung & helle Oberflächen", heat:2, air:1 },
  { action:"Hitzeschutz in Gebäuden (passiv)", heat:2, air:1 },
  { action:"Verkehrsreduktion / aktive Mobilität", heat:1, air:2 },
  { action:"ÖV/Flottenumstellung", heat:1, air:2 },
];

const m6_facts = [
  { title:"Wien – Hitzeschutz & kühle Orte", value:"Cool Spots / Trinkbrunnen / Beschattung", sub:"Beispiel: Maßnahmenbündel gegen Hitzestress." },
  { title:"Graz – Stadtgrün & Entsiegelung", value:"Bäume, Grünachsen, Entsiegelungsprojekte", sub:"Beispiel: Mikroklima verbessern." },
  { title:"Linz – Mobilität & Emissionen", value:"Verkehrsmaßnahmen, Flottenmodernisierung", sub:"Beispiel: NO₂/PM runter, weniger Abwärme." },
  { title:"Innsbruck – Talinversion & Luft", value:"Winterepisoden adressieren (Verkehr/Heizen)", sub:"Beispiel: Topografie + Maßnahmenmix." },
];

d3.select("#lastUpdated").text("Datenstand: " + new Date().toLocaleString("de-AT"));

// --------------------------
// KPI MODULE 1
// --------------------------
const pm25Last = last(pm25_annual).value;
const no2TrafficLast = last(no2_traffic).value; // declared ONCE
const o3DaysLast = last(o3_episode_days).value;
const doubleLast = last(m4_double_days).value;

const kpis = [
  { label:"PM₂.₅ (Jahresmittel)", value: pm25Last + " µg/m³", note:"Langfristige Belastung (Mock)" },
  { label:"NO₂ Verkehr (Jahresmittel)", value: no2TrafficLast + " µg/m³", note:"Verkehrsnähe (Mock)" },
  { label:"O₃ Episoden-Tage", value: o3DaysLast + " Tage", note:"Sommer-Episoden (Mock)" },
  { label:"Doppelbelastung (heiß + O₃)", value: doubleLast + " Tage", note:"Kombinierter Stressor (Mock)" },
];

d3.select("#kpis").selectAll("div.kpi")
  .data(kpis)
  .enter().append("div").attr("class","kpi")
  .html(d => `
    <div class="label">${d.label}</div>
    <div class="value">${d.value}</div>
    <div class="note">${d.note}</div>
  `);

// --------------------------
// D3 helpers
// --------------------------
function styleAxis(g){
  g.selectAll("text").attr("fill","#64748b");
  g.selectAll("path,line").attr("stroke","#cbd5e1");
}
function clearAndSize(container){
  const el = d3.select(container);
  const node = el.node();
  if (!node) {
    return null; // Container doesn't exist
  }
  el.selectAll("svg").remove();
  return { el, w: node.clientWidth, h: node.clientHeight };
}
function lineChart(container, seriesList, opts){
  const cleared = clearAndSize(container);
  if (!cleared) return; // Container doesn't exist
  const { el, w, h } = cleared;
  const margin = { top: 18, right: 18, bottom: 34, left: 46 };
  const iw = w - margin.left - margin.right;
  const ih = h - margin.top - margin.bottom;

  // Normalize + sort series by year and derive x-domain from actual data.
  // This makes charts like PM₂.₅ adapt their x-axis to JSON (first/last year).
  const normalizedSeries = (seriesList || []).map((s) => {
    const values = (s?.values || [])
      .map((d) => ({
        year: Number(d.year),
        value: Number(d.value),
      }))
      .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.value))
      .sort((a, b) => a.year - b.year);
    return { name: s?.name || "", values };
  });

  const allYearsFromData = normalizedSeries.flatMap((s) => s.values.map((d) => d.year));
  const xDomain = (allYearsFromData.length > 0) ? d3.extent(allYearsFromData) : d3.extent(years);

  const svg = el.append("svg").attr("width", w).attr("height", h);
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain(xDomain).range([0, iw]);
  const allValues = normalizedSeries.flatMap(s => s.values.map(d=>d.value));
  const y = d3.scaleLinear().domain([0, d3.max(allValues)*1.15]).nice().range([ih, 0]);

  styleAxis(g.append("g").attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d"))));
  styleAxis(g.append("g").call(d3.axisLeft(y).ticks(5)));

  // Add Y-axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -ih / 2)
    .attr("y", -36)
    .attr("text-anchor", "middle")
    .attr("fill", "#64748b")
    .attr("font-size", 12)
    .text(opts?.yLabel || "Jahresmittel in µg/m³");

  // Draw reference line if value is provided and is a valid number
  const refLineVal = opts?.refLine;
  if (refLineVal != null && refLineVal !== undefined && !isNaN(refLineVal) && isFinite(refLineVal)){
    debugLog('lineChart: Drawing reference line at value:', refLineVal, 'y position:', y(refLineVal), 'y domain:', y.domain());
    g.append("line").attr("x1",0).attr("x2",iw)
      .attr("y1", y(refLineVal)).attr("y2", y(refLineVal))
      .attr("stroke","#f59e0b").attr("stroke-dasharray","6 6").attr("stroke-opacity",0.7)
      .attr("stroke-width", 1.5);
    g.append("text").attr("x",0).attr("y", y(refLineVal)-6)
      .attr("fill","#d97706").attr("font-size",11)
      .text(opts.refLabel || "Referenz");
  } else {
    debugLog('lineChart: No reference line - refLineVal:', refLineVal, 'type:', typeof refLineVal, 'isNaN:', isNaN(refLineVal), 'isFinite:', isFinite(refLineVal));
  }

  const line = d3.line().x(d=>x(d.year)).y(d=>y(d.value));
  normalizedSeries.forEach((s, idx) => {
    if (!s.values.length) return;
    const stroke = idx === 0 ? "#2e88c1" : "#10b981";
    g.append("path").datum(s.values).attr("fill","none").attr("stroke",stroke).attr("stroke-width",2).attr("d", line);
    g.append("text").attr("x",iw).attr("y", y(last(s.values).value)).attr("dx",-2).attr("dy",-6)
      .attr("text-anchor","end").attr("fill",stroke).attr("font-size",11).text(s.name);
  });

  g.append("text").attr("x",0).attr("y",-4).attr("fill","#64748b")
    .attr("font-size",11).text(opts?.subtitle || "");
}

function barChart(container, values, opts){
  const cleared = clearAndSize(container);
  if (!cleared) return; // Container doesn't exist
  const { el, w, h } = cleared;
  const margin = { top: 18, right: 18, bottom: 34, left: 46 };
  const iw = w - margin.left - margin.right;
  const ih = h - margin.top - margin.bottom;

  const svg = el.append("svg").attr("width", w).attr("height", h);
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(values.map(d=>d.year)).range([0, iw]).padding(0.2);
  const y = d3.scaleLinear().domain([0, d3.max(values, d=>d.value)*1.15]).nice().range([ih, 0]);

  styleAxis(g.append("g").attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(x).tickValues(values.filter((d,i)=>i%4===0).map(d=>d.year)).tickFormat(d3.format("d"))));
  styleAxis(g.append("g").call(d3.axisLeft(y).ticks(5)));

  if (opts?.refLine != null){
    g.append("line").attr("x1",0).attr("x2",iw)
      .attr("y1", y(opts.refLine)).attr("y2", y(opts.refLine))
      .attr("stroke","#f59e0b").attr("stroke-dasharray","6 6").attr("stroke-opacity",0.7);
    g.append("text").attr("x",0).attr("y", y(opts.refLine)-6)
      .attr("fill","#d97706").attr("font-size",11)
      .text(opts.refLabel || "Referenz");
  }

  g.selectAll("rect").data(values).enter().append("rect")
    .attr("x", d=>x(d.year)).attr("y", d=>y(d.value))
    .attr("width", x.bandwidth()).attr("height", d=>ih - y(d.value))
    .attr("fill","#60a5fa").attr("stroke","#2e88c1").attr("stroke-width",1.5);

  g.append("text").attr("x",0).attr("y",-4).attr("fill","#64748b")
    .attr("font-size",11).text(opts?.subtitle || "");
}

function scatterChart(container, points, opts){
  const cleared = clearAndSize(container);
  if (!cleared) return; // Container doesn't exist
  const { el, w, h } = cleared;
  const margin = { top: 18, right: 18, bottom: 34, left: 46 };
  const iw = w - margin.left - margin.right;
  const ih = h - margin.top - margin.bottom;

  const svg = el.append("svg").attr("width", w).attr("height", h);
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain(d3.extent(points, d=>d.tmax)).nice().range([0, iw]);
  const y = d3.scaleLinear().domain(d3.extent(points, d=>d.o3)).nice().range([ih, 0]);

  styleAxis(g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(6)));
  styleAxis(g.append("g").call(d3.axisLeft(y).ticks(5)));

  // regression
  const meanX = d3.mean(points, d=>d.tmax);
  const meanY = d3.mean(points, d=>d.o3);
  let num=0, den=0;
  for (const p of points){ num += (p.tmax-meanX)*(p.o3-meanY); den += (p.tmax-meanX)**2; }
  const slope = den===0 ? 0 : num/den;
  const intercept = meanY - slope*meanX;

  const xLine = d3.extent(points, d=>d.tmax);
  const linePts = [
    { tmax:xLine[0], o3: slope*xLine[0] + intercept },
    { tmax:xLine[1], o3: slope*xLine[1] + intercept },
  ];

  g.append("path").datum(linePts).attr("fill","none")
    .attr("stroke","#f59e0b").attr("stroke-width",2)
    .attr("d", d3.line().x(d=>x(d.tmax)).y(d=>y(d.o3)));

  g.selectAll("circle").data(points).enter().append("circle")
    .attr("cx", d=>x(d.tmax)).attr("cy", d=>y(d.o3)).attr("r",3)
    .attr("fill","#60a5fa").attr("stroke","#2e88c1").attr("stroke-width",1.5);

  g.append("text").attr("x",0).attr("y",-4).attr("fill","#64748b")
    .attr("font-size",11).text(opts?.subtitle || "");
}

function cobenefitChart(container, actions){
  const cleared = clearAndSize(container);
  if (!cleared) return; // Container doesn't exist
  const { el, w, h } = cleared;
  const margin = { top: 18, right: 18, bottom: 34, left: 210 };
  const iw = w - margin.left - margin.right;
  const ih = h - margin.top - margin.bottom;

  const svg = el.append("svg").attr("width", w).attr("height", h);
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand().domain(actions.map(d=>d.action)).range([0, ih]).padding(0.22);
  const x = d3.scaleBand().domain(["Hitze", "Luft"]).range([0, iw]).padding(0.25);

  styleAxis(g.append("g").call(d3.axisTop(x).tickSizeOuter(0)));
  styleAxis(g.append("g").call(d3.axisLeft(y).tickSizeOuter(0)));

  const cells = [];
  actions.forEach(a=>{
    cells.push({ action:a.action, dim:"Hitze", score:a.heat });
    cells.push({ action:a.action, dim:"Luft", score:a.air });
  });

  const scoreToFill = s => s===2 ? "#34d399" : s===1 ? "#fbbf24" : "#f87171";
  const scoreToStroke = s => s===2 ? "#10b981" : s===1 ? "#f59e0b" : "#ef4444";
  const scoreToLabel = s => s===2 ? "hoch" : s===1 ? "mittel" : "niedrig";

  g.selectAll("rect").data(cells).enter().append("rect")
    .attr("x", d=>x(d.dim)).attr("y", d=>y(d.action))
    .attr("width", x.bandwidth()).attr("height", y.bandwidth())
    .attr("rx",8).attr("ry",8)
    .attr("fill", d=>scoreToFill(d.score))
    .attr("stroke", d=>scoreToStroke(d.score)).attr("stroke-width",1.5);

  g.selectAll("text.cell").data(cells).enter().append("text")
    .attr("x", d=>x(d.dim)+x.bandwidth()/2)
    .attr("y", d=>y(d.action)+y.bandwidth()/2+4)
    .attr("text-anchor","middle")
    .attr("font-size",11)
    .attr("fill","#1e293b")
    .attr("font-weight","500")
    .text(d=>scoreToLabel(d.score));

  g.append("text").attr("x",0).attr("y",-8).attr("fill","#64748b").attr("font-size",11)
    .text("Qualitative Einordnung (Mock) – als evidenzbasierte Matrix versionieren.");
}

// --------------------------
// Takeaways + big numbers (uses no2TrafficLast without redeclaring)
// --------------------------
// Module 2
const xs = m2_pairs.map(d=>d.tmax), ys = m2_pairs.map(d=>d.o3);
const mx = d3.mean(xs), my = d3.mean(ys);
let num=0, den=0;
for (let i=0;i<m2_pairs.length;i++){ num += (xs[i]-mx)*(ys[i]-my); den += (xs[i]-mx)*(xs[i]-mx); }
const slopeApprox = den===0 ? 0 : num/den;

d3.select("#m2Big").text("+" + slopeApprox.toFixed(1) + " µg/m³ pro °C");
d3.select("#m2Takeaway").text("Im Sommer steigen Ozon-Maxima typischerweise mit hohen Temperaturen (hier als einfacher Zusammenhang visualisiert).");

// Module 3
const tnCityLast = last(m3_tropical_nights_city).value;
const tnRuralLast = last(m3_tropical_nights_rural).value;
const deltaLast = last(m3_uhi_delta).value;
d3.select("#m3Takeaway").text(`Letztes Jahr (Mock): Tropennächte Stadt ${tnCityLast} vs. Umland ${tnRuralLast} · nächtliche UHI-Differenz ≈ ${deltaLast}°C.`);

// Module 4
d3.select("#m4Big").text(last(m4_double_days).value + " Tage");
d3.select("#m4Takeaway").text("Doppelbelastung ist kommunikativ stark: an manchen Tagen treffen Hitze und hohe Ozonwerte zusammen.");

// Air sections - Only update if element is empty (not set from block settings)
const pm25BigEl = d3.select("#pm25Big");
if (pm25BigEl.node() && (!pm25BigEl.text().trim() || pm25BigEl.text().trim() === '—')) {
  pm25BigEl.text(pm25Last + " µg/m³");
}
const pm25TakeawayEl = d3.select("#pm25Takeaway");
if (pm25TakeawayEl.node() && (!pm25TakeawayEl.text().trim() || pm25TakeawayEl.text().trim() === '—')) {
  pm25TakeawayEl.text(`Langfristiger Trend (Mock): −${(pm25_annual[0].value - pm25Last).toFixed(1)} µg/m³ seit ${years[0]}.`);
}

const no2BackLast = last(no2_background).value;
const no2BigEl = d3.select("#no2Big");
if (no2BigEl.node() && (!no2BigEl.text().trim() || no2BigEl.text().trim() === '—')) {
  no2BigEl.text(no2TrafficLast + " µg/m³");
}
const no2TakeawayEl = d3.select("#no2Takeaway");
if (no2TakeawayEl.node() && (!no2TakeawayEl.text().trim() || no2TakeawayEl.text().trim() === '—')) {
  no2TakeawayEl.text(`Verkehr bleibt höher (Mock): Δ ≈ ${(no2TrafficLast - no2BackLast).toFixed(1)} µg/m³ im letzten Jahr.`);
}

const o3BigEl = d3.select("#o3Big");
if (o3BigEl.node() && (!o3BigEl.text().trim() || o3BigEl.text().trim() === '—')) {
  o3BigEl.text(last(o3_episode_days).value + " Tage");
}
const o3TakeawayEl = d3.select("#o3Takeaway");
if (o3TakeawayEl.node() && (!o3TakeawayEl.text().trim() || o3TakeawayEl.text().trim() === '—')) {
  o3TakeawayEl.text("Ozon zeigt starke Jahr-zu-Jahr-Schwankungen (Wetterlage dominiert) – plus Hitze-Kopplung.");
}

const pm10BigEl = d3.select("#pm10Big");
if (pm10BigEl.node() && (!pm10BigEl.text().trim() || pm10BigEl.text().trim() === '—')) {
  pm10BigEl.text(last(pm10_high_days).value + " Tage");
}
const pm10TakeawayEl = d3.select("#pm10Takeaway");
if (pm10TakeawayEl.node() && (!pm10TakeawayEl.text().trim() || pm10TakeawayEl.text().trim() === '—')) {
  pm10TakeawayEl.text("PM₁₀-Episoden hängen stark an Meteorologie (Inversion), Emissionen und Ferntransport.");
}

// Module 5
d3.select("#m5Takeaway").text("Anpassung wirkt am besten als Paket: Stadtgrün + Hitzeschutz + Emissionen senken → weniger Belastung, mehr Resilienz.");

// Module 6
d3.select("#m6Facts").selectAll("div.factCard")
  .data(m6_facts)
  .enter().append("div")
  .attr("class","factCard")
  .html(d => `
    <div class="t">${d.title}</div>
    <div class="v">${d.value}</div>
    <div class="s">${d.sub}</div>
  `);

// --------------------------
// Austria Map with PM2.5 data using Leaflet
// --------------------------
let austriaLeafletMap = null;

function austriaMap(container, stations, opts){
  // Clear container and remove existing map
  const containerEl = document.querySelector(container);
  if (!containerEl) {
    debugError('Austria map: Container not found:', container);
    return;
  }
  
  debugLog('Austria map: Initializing map in container:', container);
  
  // Remove existing map if it exists
  if (austriaLeafletMap) {
    austriaLeafletMap.remove();
    austriaLeafletMap = null;
  }
  
  containerEl.innerHTML = '';
  
  // Check if Leaflet is available
  if (typeof L === 'undefined') {
    debugError('Austria map: Leaflet library (L) is not defined. Make sure Leaflet is loaded before this script.');
    containerEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">Karte wird geladen...</p>';
    // Try to wait a bit and retry
    setTimeout(() => {
      if (typeof L !== 'undefined') {
        debugLog('Austria map: Leaflet loaded, retrying...');
        austriaMap(container, stations, opts);
      } else {
        debugError('Austria map: Leaflet still not loaded after timeout');
        containerEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #f00;">Fehler: Leaflet-Bibliothek konnte nicht geladen werden.</p>';
      }
    }, 500);
    return;
  }
  
  debugLog('Austria map: Leaflet loaded, creating map with', stations.length, 'stations');

    // Initialize Leaflet map centered on Austria
    try {
      const map = L.map(containerEl, {
        center: [47.5162, 14.5501], // Center of Austria
        zoom: 8,
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: true
      });
    
    debugLog('Austria map: Map created successfully');

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // PM2.5 color scale function (European Air Quality Index)
    function getPM25Color(pm25) {
      if (pm25 <= 10) return 'rgb(80, 240, 230)';      // 0–10 µg/m³ | Gut
      if (pm25 <= 20) return 'rgb(80, 204, 170)';      // 10–20 µg/m³ | Ausreichend
      if (pm25 <= 25) return 'rgb(240, 230, 65)';      // 20–25 µg/m³ | Mäßig
      if (pm25 <= 50) return 'rgb(255, 80, 80)';       // 25–50 µg/m³ | Schlecht
      if (pm25 <= 75) return 'rgb(150, 0, 50)';        // 50–75 µg/m³ | Sehr schlecht
      return 'rgb(125, 33, 129)';                      // 75+ µg/m³ | Extrem schlecht
    }

    // Fixed radius for all markers (no scaling by value)
    const markerRadius = 8;

    // Add markers for each station
    stations.forEach(s => {
      const pm25 = s.pm25 || 0;
      const color = getPM25Color(pm25);

      // Create custom marker icon with fixed size
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: ${markerRadius * 2}px;
          height: ${markerRadius * 2}px;
          border-radius: 50%;
          background-color: ${color};
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [markerRadius * 2, markerRadius * 2],
        iconAnchor: [markerRadius, markerRadius]
      });

      // Create marker with popup
      L.marker([s.lat, s.lon], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`
          <strong>${s.name}</strong><br>
          PM₂.₅: ${pm25.toFixed(1)} µg/m³
        `);
    });

    // Add legend
    const legend = L.control({ position: 'topleft' });
    legend.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'pm25-legend');
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
          <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;"> Feinstaub PM₂.₅ (µg/m³)</div>
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <div style="width: 16px; height: 16px; border-radius: 50%; background-color: rgb(80, 240, 230); border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2); margin-right: 8px;"></div>
            <div style="flex: 1;"><span style="font-size: 12px;">0–10</span> <span style="font-size: 11px; color: #666;">Gut</span></div>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <div style="width: 16px; height: 16px; border-radius: 50%; background-color: rgb(80, 204, 170); border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2); margin-right: 8px;"></div>
            <div style="flex: 1;"><span style="font-size: 12px;">10–20</span> <span style="font-size: 11px; color: #666;">Ausreichend</span></div>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <div style="width: 16px; height: 16px; border-radius: 50%; background-color: rgb(240, 230, 65); border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2); margin-right: 8px;"></div>
            <div style="flex: 1;"><span style="font-size: 12px;">20–25</span> <span style="font-size: 11px; color: #666;">Mäßig</span></div>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <div style="width: 16px; height: 16px; border-radius: 50%; background-color: rgb(255, 80, 80); border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2); margin-right: 8px;"></div>
            <div style="flex: 1;"><span style="font-size: 12px;">25–50</span> <span style="font-size: 11px; color: #666;">Schlecht</span></div>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <div style="width: 16px; height: 16px; border-radius: 50%; background-color: rgb(150, 0, 50); border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2); margin-right: 8px;"></div>
            <div style="flex: 1;"><span style="font-size: 12px;">50–75</span> <span style="font-size: 11px; color: #666;">Sehr schlecht</span></div>
          </div>
          <div style="display: flex; align-items: center;">
            <div style="width: 16px; height: 16px; border-radius: 50%; background-color: rgb(125, 33, 129); border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2); margin-right: 8px;"></div>
            <div style="flex: 1;"><span style="font-size: 12px;">75+</span> <span style="font-size: 11px; color: #666;">Extrem schlecht</span></div>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    // Add Datahub link button
    const datahubControl = L.control({ position: 'bottomright' });
    datahubControl.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'datahub-link-control');
      div.innerHTML = `
        <a href="https://datahub.luftdaten.at" target="_blank" rel="noopener noreferrer" 
           style="display: inline-block; background: white; padding: 8px 12px; border-radius: 6px; 
                  box-shadow: 0 2px 8px rgba(0,0,0,0.2); text-decoration: none; color: #2e88c1; 
                  font-size: 14px; font-weight: 600; white-space: nowrap;">
          Vollständige Ansicht im Datahub
        </a>
      `;
      return div;
    };
    datahubControl.addTo(map);

    // Add timestamp box
    if (opts && opts.timestamp) {
      const timestampControl = L.control({ position: 'topright' });
      timestampControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'timestamp-control');
        // Format timestamp (e.g., "2026-01-05 23:47:45" -> "05.01.2026 23:47")
        const date = new Date(opts.timestamp);
        const formattedDate = date.toLocaleDateString('de-DE', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        div.innerHTML = `
          <div style="background: white; padding: 8px 12px; border-radius: 6px; 
                      box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; color: #666;">
            <div style="font-weight: 600; margin-bottom: 2px; color: #333;">Datenstand</div>
            <div>${formattedDate}</div>
          </div>
        `;
        return div;
      };
      timestampControl.addTo(map);
    }

    // Store map reference for cleanup
    austriaLeafletMap = map;

    // Fit bounds to show all markers
    if (stations.length > 0) {
      const bounds = stations.map(s => [s.lat, s.lon]);
      map.fitBounds(bounds, { padding: [20, 20] });
      debugLog('Austria map: Map initialized with', stations.length, 'stations');
    }
  } catch (error) {
    debugError('Austria map: Error creating map:', error);
    containerEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #f00;">Fehler beim Erstellen der Karte: ' + error.message + '</p>';
  }
}

// Mock data for Austria stations with PM2.5 values
const austria_stations = [
  { name: "Wien", lon: 16.3738, lat: 48.2082, pm25: 12.5 },
  { name: "Graz", lon: 15.4395, lat: 47.0707, pm25: 9.8 },
  { name: "Linz", lon: 14.2858, lat: 48.3069, pm25: 15.2 },
  { name: "Salzburg", lon: 13.0550, lat: 47.8095, pm25: 8.3 },
  { name: "Innsbruck", lon: 11.3850, lat: 47.2692, pm25: 11.1 },
  { name: "Klagenfurt", lon: 14.3053, lat: 46.6247, pm25: 7.6 },
  { name: "St. Pölten", lon: 15.6247, lat: 48.2048, pm25: 13.4 },
  { name: "Bregenz", lon: 9.7471, lat: 47.5031, pm25: 6.9 },
  { name: "Eisenstadt", lon: 16.5234, lat: 47.8450, pm25: 10.2 },
  { name: "Villach", lon: 13.8505, lat: 46.6111, pm25: 9.5 },
  { name: "Wels", lon: 14.0281, lat: 48.1565, pm25: 14.1 },
  { name: "Dornbirn", lon: 9.7438, lat: 47.4127, pm25: 7.2 },
  { name: "Steyr", lon: 14.4217, lat: 48.0425, pm25: 12.8 },
  { name: "Wiener Neustadt", lon: 16.2317, lat: 47.8131, pm25: 13.7 },
  { name: "Kapfenberg", lon: 15.2861, lat: 47.4436, pm25: 11.9 },
  { name: "Amstetten", lon: 14.8725, lat: 48.1225, pm25: 10.5 },
  { name: "Leonding", lon: 14.2533, lat: 48.2794, pm25: 14.6 },
  { name: "Klosterneuburg", lon: 16.3253, lat: 48.3053, pm25: 12.2 },
  { name: "Baden", lon: 16.2322, lat: 48.0064, pm25: 11.4 },
  { name: "Wolfsberg", lon: 14.8439, lat: 46.8419, pm25: 8.7 },
];

// --------------------------
// Render charts
// --------------------------
function renderAll(){
  debugLog('[RENDER] ========================================');
  debugLog('[RENDER] renderAll: Starting to render charts...');
  debugLog('[RENDER] Timestamp:', new Date().toISOString());
  debugLog('[RENDER] ========================================');
  
  try {
    debugLog('renderAll: Rendering scatterChart...');
  scatterChart("#m2Scatter", m2_pairs, { subtitle:"Sommer: Tmax vs. O₃ Tagesmaximum (Mock) + Trendlinie" });

    debugLog('renderAll: Rendering lineCharts...');
  lineChart("#m3TropicalNights", [
    { name:"Stadt", values: m3_tropical_nights_city },
    { name:"Umland", values: m3_tropical_nights_rural },
  ], { subtitle:"Tropennächte pro Jahr (Mock)" });

  lineChart("#m3UhiDelta", [
    { name:"ΔT Nacht (Stadt–Umland)", values: m3_uhi_delta },
  ], { subtitle:"UHI-Indikator (Mock)", refLine: 1.5, refLabel:"Beispiel-Referenz" });

    debugLog('renderAll: Rendering barCharts...');
  barChart("#m4Bars", m4_double_days, { subtitle:"Tage/Jahr: heiß & O₃ hoch (Mock)" });

  // PM2.5 Chart - check for API data
  debugLog('renderAll: [PM2.5 DEBUG] Starting PM2.5 chart rendering...');
  const pm25Container = document.querySelector("#pm25Chart");
  if (pm25Container) {
    debugLog('renderAll: [PM2.5 DEBUG] PM2.5 container found:', pm25Container);
    const pm25ApiUrl = pm25Container.getAttribute('data-api-url');
    debugLog('renderAll: [PM2.5 DEBUG] data-api-url attribute:', pm25ApiUrl);
    
    if (pm25ApiUrl) {
      debugLog('renderAll: [PM2.5 DEBUG] Fetching PM2.5 chart data from API:', pm25ApiUrl);
      fetch(pm25ApiUrl)
        .then(response => {
          debugLog('renderAll: [PM2.5 DEBUG] Fetch response received:', {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          debugLog('renderAll: [PM2.5 DEBUG] JSON parsed successfully');
          debugLog('renderAll: [PM2.5 DEBUG] Full response data:', data);
          debugLog('renderAll: [PM2.5 DEBUG] Response keys:', Object.keys(data));
          
          // Extract chart data from REST API response
          // The REST API response includes dataset_data (parsed) or dataset_json_data (raw string)
          let chartData = null;
          
          // First, try to use the parsed dataset_data if available
          if (data && data.dataset_data) {
            debugLog('renderAll: [PM2.5 DEBUG] Found dataset_data:', data.dataset_data);
            debugLog('renderAll: [PM2.5 DEBUG] dataset_data type:', typeof data.dataset_data);
            debugLog('renderAll: [PM2.5 DEBUG] dataset_data.data:', data.dataset_data.data);
            debugLog('renderAll: [PM2.5 DEBUG] dataset_data.data is array?', Array.isArray(data.dataset_data.data));
            
            if (data.dataset_data.data && Array.isArray(data.dataset_data.data)) {
              chartData = data.dataset_data;
              debugLog('renderAll: [PM2.5 DEBUG] Using dataset_data from REST API response');
            } else {
              debugWarn('renderAll: [PM2.5 DEBUG] dataset_data exists but data.data is not an array');
            }
          } 
          // Fallback: try to parse dataset_json_data if it's a string
          else if (data && data.dataset_json_data) {
            debugLog('renderAll: [PM2.5 DEBUG] Found dataset_json_data (type:', typeof data.dataset_json_data, ', length:', data.dataset_json_data ? data.dataset_json_data.length : 0, ')');
            try {
              chartData = JSON.parse(data.dataset_json_data);
              debugLog('renderAll: [PM2.5 DEBUG] Successfully parsed dataset_json_data:', chartData);
            } catch (e) {
              debugError('renderAll: [PM2.5 DEBUG] Error parsing dataset_json_data:', e);
              debugError('renderAll: [PM2.5 DEBUG] dataset_json_data content (first 500 chars):', data.dataset_json_data ? data.dataset_json_data.substring(0, 500) : 'null');
            }
          }
          // Fallback: if data is already in the correct format (direct JSON file)
          else if (data && data.data && Array.isArray(data.data)) {
            chartData = data;
            debugLog('renderAll: [PM2.5 DEBUG] Using data directly from response');
          } else {
            debugWarn('renderAll: [PM2.5 DEBUG] No valid chart data found in response');
            debugWarn('renderAll: [PM2.5 DEBUG] Available keys in data:', Object.keys(data || {}));
          }
          
          if (chartData && chartData.data && Array.isArray(chartData.data)) {
            debugLog('renderAll: [PM2.5 DEBUG] Chart data is valid, extracting series...');
            // Extract metadata for options
            const metadata = chartData.metadata || {};
            debugLog('renderAll: [PM2.5 DEBUG] Metadata:', metadata);
            
            const seriesList = chartData.data.map(series => ({
              name: series.name || 'PM₂.₅',
              values: series.values || []
            }));
            
            debugLog('renderAll: [PM2.5 DEBUG] Series list:', seriesList);
            debugLog('renderAll: [PM2.5 DEBUG] Number of series:', seriesList.length);
            seriesList.forEach((series, idx) => {
              debugLog(`renderAll: [PM2.5 DEBUG] Series ${idx}:`, {
                name: series.name,
                valueCount: series.values.length,
                firstValue: series.values[0],
                lastValue: series.values[series.values.length - 1]
              });
            });
            
            // Get Y-axis label and reference line from data attributes or metadata
            const yLabel = pm25Container.getAttribute('data-y-label') || metadata.yLabel || "Jahresmittel in µg/m³";
            const refLineAttr = pm25Container.getAttribute('data-ref-line');
            let refLineValue = null;
            if (refLineAttr !== null && refLineAttr !== '') {
              refLineValue = parseFloat(refLineAttr);
              if (isNaN(refLineValue)) {
                refLineValue = null;
              }
            } else if (metadata.refLine !== undefined && metadata.refLine !== null) {
              refLineValue = parseFloat(metadata.refLine);
              if (isNaN(refLineValue)) {
                refLineValue = null;
              }
            }
            const refLineLabel = pm25Container.getAttribute('data-ref-label') || metadata.refLabel || "Referenz";
            
            const chartOptions = {
              subtitle: metadata.subtitle || "Jahresmittel",
              yLabel: yLabel,
              refLine: refLineValue,
              refLabel: refLineLabel
            };
            debugLog('renderAll: [PM2.5 DEBUG] Reference line value:', refLineValue, 'from attribute:', refLineAttr);
            debugLog('renderAll: [PM2.5 DEBUG] Chart options:', chartOptions);
            debugLog('renderAll: [PM2.5 DEBUG] Calling lineChart with API data...');
            
            lineChart("#pm25Chart", seriesList, chartOptions);
            
            debugLog('renderAll: [PM2.5 DEBUG] lineChart called successfully');
          } else {
            debugWarn('renderAll: [PM2.5 DEBUG] Invalid chart data format');
            debugWarn('renderAll: [PM2.5 DEBUG] chartData:', chartData);
            debugWarn('renderAll: [PM2.5 DEBUG] chartData.data:', chartData ? chartData.data : 'null');
            debugWarn('renderAll: [PM2.5 DEBUG] Using mock data as fallback');
            
            // Still read reference line from data attributes even with mock data
            const refLineAttr = pm25Container.getAttribute('data-ref-line');
            let refLineValue = 10; // default
            if (refLineAttr !== null && refLineAttr !== '') {
              const parsed = parseFloat(refLineAttr);
              if (!isNaN(parsed)) {
                refLineValue = parsed;
              }
            }
            const refLineLabel = pm25Container.getAttribute('data-ref-label') || "EU 2030: 10 µg/m³ (Kontext)";
            const yLabel = pm25Container.getAttribute('data-y-label') || "Jahresmittel in µg/m³";
            
            lineChart("#pm25Chart", [{ name:"PM₂.₅", values: pm25_annual }],
              { subtitle:"Jahresmittel (Mock)", yLabel: yLabel, refLine: refLineValue, refLabel: refLineLabel });
          }
        })
        .catch(error => {
          debugError('renderAll: [PM2.5 DEBUG] Error fetching PM2.5 chart data:', error);
          debugError('renderAll: [PM2.5 DEBUG] Error stack:', error.stack);
          debugLog('renderAll: [PM2.5 DEBUG] Using mock data as fallback');
          
          // Still read reference line from data attributes even with mock data
          const refLineAttr = pm25Container.getAttribute('data-ref-line');
          let refLineValue = 10; // default
          if (refLineAttr !== null && refLineAttr !== '') {
            const parsed = parseFloat(refLineAttr);
            if (!isNaN(parsed)) {
              refLineValue = parsed;
            }
          }
          const refLineLabel = pm25Container.getAttribute('data-ref-label') || "EU 2030: 10 µg/m³ (Kontext)";
          const yLabel = pm25Container.getAttribute('data-y-label') || "Jahresmittel in µg/m³";

  lineChart("#pm25Chart", [{ name:"PM₂.₅", values: pm25_annual }],
            { subtitle:"Jahresmittel (Mock)", yLabel: yLabel, refLine: refLineValue, refLabel: refLineLabel });
        });
    } else {
      // No API URL, use mock data but still read reference line from data attributes
      debugLog('renderAll: [PM2.5 DEBUG] No data-api-url found, using mock data');
      
      const refLineAttr = pm25Container.getAttribute('data-ref-line');
      let refLineValue = null;
      if (refLineAttr !== null && refLineAttr !== '') {
        const parsed = parseFloat(refLineAttr);
        if (!isNaN(parsed)) {
          refLineValue = parsed;
        }
      }
      // Default to 10 only if no attribute is set
      if (refLineValue === null) {
        refLineValue = 10;
      }
      const refLineLabel = pm25Container.getAttribute('data-ref-label') || "EU 2030: 10 µg/m³ (Kontext)";
      const yLabel = pm25Container.getAttribute('data-y-label') || "Jahresmittel in µg/m³";
      
      debugLog('renderAll: [PM2.5 DEBUG] Reference line for mock data:', refLineValue, 'from attribute:', refLineAttr);
      lineChart("#pm25Chart", [{ name:"PM₂.₅", values: pm25_annual }],
        { subtitle:"Jahresmittel (Mock)", yLabel: yLabel, refLine: refLineValue, refLabel: refLineLabel });
    }
  } else {
    debugWarn('renderAll: [PM2.5 DEBUG] PM2.5 container not found!');
  }

  lineChart("#no2Chart", [
    { name:"Verkehr", values: no2_traffic },
    { name:"Hintergrund", values: no2_background }
  ], { subtitle:"Jahresmittel (Mock)", refLine: 20, refLabel:"EU 2030: 20 µg/m³ (Kontext)" });

  barChart("#o3Chart", o3_episode_days, { subtitle:"Episoden-Tage/Jahr (Mock)" });

  barChart("#pm10Chart", pm10_high_days,
    { subtitle:"Tage/Jahr (Mock)", refLine: 35, refLabel:"EU heute: 35 Tage (Kontext)" });

    debugLog('renderAll: Rendering cobenefitChart...');
  cobenefitChart("#m5Cobenefits", m5_actions);

  debugLog('renderAll: Rendering austriaMap...');
  // Check if container exists and has data-api-url
  const mapContainer = document.querySelector("#austria-pm25-map");
  if (mapContainer) {
    const apiUrl = mapContainer.getAttribute('data-api-url');
    if (apiUrl) {
      debugLog('renderAll: Fetching map data from API:', apiUrl);
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(text => {
          // Replace NaN, Infinity, -Infinity with null (JSON doesn't support these)
          // Note: NaN might appear as unquoted NaN in the JSON string
          let cleanedText = text.replace(/:\\s*NaN\\b/gi, ': null')
                                .replace(/:\\s*Infinity\\b/gi, ': null')
                                .replace(/:\\s*-Infinity\\b/gi, ': null')
                                .replace(/NaN/gi, 'null')  // Fallback: replace any NaN
                                .replace(/Infinity/gi, 'null')  // Fallback: replace any Infinity
                                .replace(/-Infinity/gi, 'null');  // Fallback: replace any -Infinity
          try {
            return JSON.parse(cleanedText);
          } catch (e) {
            debugError('renderAll: JSON parsing error:', e);
            debugError('renderAll: Error at position:', e.message);
            // Try to find the problematic section
            const errorPos = e.message.match(/position (\\d+)/);
            if (errorPos) {
              const pos = parseInt(errorPos[1]);
              const start = Math.max(0, pos - 100);
              const end = Math.min(text.length, pos + 100);
              debugError('renderAll: Problematic section:', text.substring(start, end));
            } else {
              debugError('renderAll: Response text (first 1000 chars):', text.substring(0, 1000));
            }
            throw new Error('Invalid JSON response: ' + e.message);
          }
        })
        .then(data => {
          debugLog('renderAll: Map data fetched successfully', data);
          // Transform API data to station format
          let stations = [];
          
          // Handle GeoJSON FeatureCollection format
          let dataTimestamp = null;
          if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
            // Find the most recent timestamp from all features
            const timestamps = data.features
              .map(f => f.properties && f.properties.time)
              .filter(t => t)
              .sort()
              .reverse(); // Sort descending to get most recent first
            
            if (timestamps.length > 0) {
              dataTimestamp = timestamps[0];
            }
            
            stations = data.features.map(feature => {
              const coords = feature.geometry.coordinates; // [lon, lat]
              const props = feature.properties;
              
              // Extract PM2.5 value from sensors
              // Dimension 3 appears to be PM2.5 based on the API response
              let pm25 = 0;
              if (props.sensors && Array.isArray(props.sensors)) {
                for (const sensor of props.sensors) {
                  if (sensor.values && Array.isArray(sensor.values)) {
                    const pm25Value = sensor.values.find(v => v.dimension === 3);
                    if (pm25Value && pm25Value.value !== null && pm25Value.value !== undefined) {
                      pm25 = parseFloat(pm25Value.value);
                      break; // Use first PM2.5 value found
                    }
                  }
                }
              }
              
              return {
                name: props.device || props.name || 'Unknown',
                lat: parseFloat(coords[1]), // GeoJSON uses [lon, lat]
                lon: parseFloat(coords[0]),
                pm25: pm25
              };
            }).filter(s => s.lat !== 0 && s.lon !== 0); // Filter out invalid coordinates
          } 
          // Handle simple array format (fallback)
          else if (data && Array.isArray(data)) {
            stations = data.map(s => ({
              name: s.name || s.city || s.station || 'Unknown',
              lat: parseFloat(s.lat || s.latitude || 0),
              lon: parseFloat(s.lon || s.longitude || s.lng || 0),
              pm25: parseFloat(s.pm25 || s.pm2_5 || s.pm2_5_value || 0)
            }));
          } 
          // Handle metadata/data structure (fallback)
          else if (data && data.data && Array.isArray(data.data)) {
            stations = data.data.map(s => ({
              name: s.name || s.city || s.station || 'Unknown',
              lat: parseFloat(s.lat || s.latitude || 0),
              lon: parseFloat(s.lon || s.longitude || s.lng || 0),
              pm25: parseFloat(s.pm25 || s.pm2_5 || s.pm2_5_value || 0)
            }));
          }
          
          // Use fetched stations or fallback to mock data
          if (stations.length === 0) {
            debugWarn('renderAll: No valid stations found in API response, using mock data');
            stations = austria_stations;
          } else {
            debugLog('renderAll: Processed', stations.length, 'stations from API');
          }
          
          austriaMap("#austria-pm25-map", stations, { subtitle:"Aktuelle PM₂.₅ Werte" });
        })
        .catch(error => {
          debugError('renderAll: Error fetching map data:', error);
          debugLog('renderAll: Using mock data as fallback');
          austriaMap("#austria-pm25-map", austria_stations, { subtitle:"Aktuelle PM₂.₅ Werte (Mock)" });
        });
    } else {
      debugLog('renderAll: No API URL, using mock data');
      austriaMap("#austria-pm25-map", austria_stations, { subtitle:"Aktuelle PM₂.₅ Werte (Mock)" });
    }
  }
  debugLog('[RENDER] renderAll: Finished rendering all charts');
  debugLog('[RENDER] ========================================');
  } catch (error) {
    debugError('[RENDER] ERROR: renderAll: Error rendering charts:', error);
    debugError('[RENDER] ERROR: renderAll: Error stack:', error.stack);
    debugError('[RENDER] ========================================');
  }
}

// Wait for DOM to be ready and Leaflet to load
function initMaps() {
  debugLog('[INIT] initMaps: DOM ready, checking for Leaflet...');
  debugLog('[INIT] Leaflet (L) available:', typeof L !== 'undefined');
  debugLog('[INIT] Document ready state:', document.readyState);
  debugLog('[INIT] PM2.5 container exists:', !!document.querySelector("#pm25Chart"));
  
  // Render all charts immediately (don't wait for Leaflet for non-map charts)
  debugLog('[INIT] Calling renderAll...');
  renderAll();
  
  // Only wait for Leaflet if we need the map
  const mapContainer = document.querySelector("#austria-pm25-map");
  if (mapContainer) {
    if (typeof L === 'undefined') {
      debugWarn('[INIT] Leaflet not loaded yet, waiting for map...');
      setTimeout(initMaps, 100);
      return;
    }
    debugLog('[INIT] Leaflet loaded, map can be rendered');
  } else {
    debugLog('[INIT] No map container found, Leaflet not needed');
  }
}

// Initialize when DOM is ready
debugLog('[INIT] Script loaded, document ready state:', document.readyState);
if (document.readyState === 'loading') {
  debugLog('[INIT] Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', function() {
    debugLog('[INIT] DOMContentLoaded fired');
    initMaps();
  });
} else {
  // DOM is already ready
  debugLog('[INIT] DOM already ready, calling initMaps immediately');
  initMaps();
}

// Handle window resize - invalidate Leaflet map size
window.addEventListener("resize", () => {
renderAll();
  // Invalidate Leaflet map size on resize
  if (austriaLeafletMap) {
    setTimeout(() => {
      austriaLeafletMap.invalidateSize();
    }, 100);
  }
});

// --------------------------
// Navigation Menu Functionality
// --------------------------
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('mainNav');
const topHeader = document.querySelector('.top-header');

// Mobile menu toggle
if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    const isActive = navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isActive);
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu when clicking a link (but not parent links with submenus on mobile)
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const menuItem = link.parentElement;
      const isParentItem = menuItem && menuItem.classList.contains('menu-item-has-children');
      const isMobile = window.innerWidth <= 768;
      
      // On mobile, toggle submenu instead of navigating
      if (isMobile && isParentItem && menuItem.querySelector('.sub-menu')) {
        e.preventDefault();
        menuItem.classList.toggle('active');
        return;
      }
      
      // Close menu for regular links
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
  
  // Handle submenu toggle on mobile
  const parentItems = navMenu.querySelectorAll('.menu-item-has-children > a');
  parentItems.forEach(parentLink => {
    parentLink.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const menuItem = parentLink.parentElement;
        menuItem.classList.toggle('active');
      }
    });
  });
}

// Sticky header scroll effect
if (topHeader) {
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 10) {
      topHeader.classList.add('scrolled');
    } else {
      topHeader.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });
}
