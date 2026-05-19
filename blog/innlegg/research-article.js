(function () {
  const ns = "http://www.w3.org/2000/svg";
  const palette = {
    blue: "#78a6ff",
    orange: "#d69b62",
    green: "#61d394",
    red: "#f26d6d",
    yellow: "#e7c56d",
    muted: "#a9b1c6",
    panel: "#101219",
    grid: "rgba(222,231,255,0.14)"
  };

  const fmt = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 });

  function el(name, attrs = {}, children = []) {
    const node = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    children.forEach((child) => node.appendChild(typeof child === "string" ? document.createTextNode(child) : child));
    return node;
  }

  function text(x, y, value, className = "ra-label", extra = {}) {
    return el("text", { x, y, class: className, ...extra }, [String(value)]);
  }

  function svg(width = 760, height = 420) {
    return el("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-hidden": "false" });
  }

  function scale(value, min, max, outMin, outMax) {
    if (max === min) return (outMin + outMax) / 2;
    return outMin + ((value - min) / (max - min)) * (outMax - outMin);
  }

  function renderBars(target, data) {
    const node = svg(1180, 620);
    const max = Math.max(...data.map((d) => d.value));
    const left = 275;
    const top = 74;
    const rowH = 76;
    node.appendChild(text(24, 34, target.dataset.title || "Rangert sammenligning", "ra-title"));
    [0, 25, 50, 75, 100].forEach((tick) => {
      const x = scale(tick, 0, 100, left, 1130);
      node.appendChild(el("line", { x1: x, y1: top - 28, x2: x, y2: 542, class: "ra-grid" }));
      node.appendChild(text(x - 10, 588, `${tick}%`, "ra-label"));
    });
    data.forEach((d, i) => {
      const y = top + i * rowH;
      const w = scale(d.value, 0, Math.max(max, 100), 0, 855);
      const fill = d.color || (d.value >= 70 ? palette.green : d.value >= 40 ? palette.orange : palette.red);
      node.appendChild(text(24, y + 32, d.label, "ra-label"));
      node.appendChild(el("rect", { x: left, y, width: 855, height: 36, rx: 8, fill: "rgba(255,255,255,0.045)" }));
      node.appendChild(el("rect", { x: left, y, width: w, height: 36, rx: 8, fill }));
      node.appendChild(text(left + Math.max(14, w - 58), y + 24, `${fmt.format(d.value)}${d.suffix || "%"}`, "ra-value"));
    });
    target.replaceChildren(node);
  }

  function renderQuadrant(target, data) {
    const node = svg(1180, 680);
    const left = 102;
    const right = 1115;
    const top = 70;
    const bottom = 585;
    node.appendChild(text(24, 34, target.dataset.title || "Prioriteringskart", "ra-title"));
    for (let i = 0; i <= 4; i += 1) {
      const x = scale(i, 0, 4, left, right);
      const y = scale(i, 0, 4, bottom, top);
      node.appendChild(el("line", { x1: x, y1: top, x2: x, y2: bottom, class: "ra-grid" }));
      node.appendChild(el("line", { x1: left, y1: y, x2: right, y2: y, class: "ra-grid" }));
    }
    node.appendChild(el("line", { x1: left, y1: scale(50, 0, 100, bottom, top), x2: right, y2: scale(50, 0, 100, bottom, top), stroke: "rgba(214,155,98,0.42)", "stroke-dasharray": "6 7" }));
    node.appendChild(el("line", { x1: scale(50, 0, 100, left, right), y1: top, x2: scale(50, 0, 100, left, right), y2: bottom, stroke: "rgba(214,155,98,0.42)", "stroke-dasharray": "6 7" }));
    node.appendChild(text(left, 642, target.dataset.x || "Lav", "ra-label"));
    node.appendChild(text(right - 118, 642, target.dataset.xmax || "Høy", "ra-label"));
    node.appendChild(text(22, top + 8, target.dataset.ymax || "Høy", "ra-label"));
    data.forEach((d) => {
      const x = scale(d.x, 0, 100, left, right);
      const y = scale(d.y, 0, 100, bottom, top);
      const r = scale(d.size || 20, 0, 100, 12, 42);
      node.appendChild(el("circle", { cx: x, cy: y, r, fill: d.color || palette.blue, opacity: "0.72", stroke: "rgba(255,255,255,0.7)" }));
      node.appendChild(text(x + r + 6, y + 4, d.label, "ra-label"));
    });
    target.replaceChildren(node);
  }

  function renderHeatmap(target, data) {
    const node = svg(1180, 620);
    const cols = data.cols;
    const rows = data.rows;
    const left = 260;
    const top = 82;
    const cellW = 250;
    const cellH = 104;
    node.appendChild(text(24, 36, target.dataset.title || "Risikomatrise", "ra-title"));
    cols.forEach((col, i) => node.appendChild(text(left + i * cellW + 14, 62, col, "ra-label")));
    rows.forEach((row, r) => node.appendChild(text(24, top + r * cellH + 60, row, "ra-label")));
    data.values.forEach((row, r) => {
      row.forEach((v, c) => {
        const fill = v >= 75 ? palette.red : v >= 55 ? palette.orange : v >= 35 ? palette.yellow : palette.green;
        node.appendChild(el("rect", { x: left + c * cellW, y: top + r * cellH, width: cellW - 10, height: cellH - 10, rx: 12, fill, opacity: scale(v, 0, 100, 0.22, 0.9) }));
        node.appendChild(text(left + c * cellW + 100, top + r * cellH + 58, v, "ra-value"));
      });
    });
    target.replaceChildren(node);
  }

  function renderLine(target, series) {
    const node = svg(1180, 620);
    const left = 84;
    const right = 1125;
    const top = 72;
    const bottom = 520;
    const years = series.years;
    const all = series.lines.flatMap((line) => line.values);
    const min = Math.min(0, ...all);
    const max = Math.max(...all);
    node.appendChild(text(24, 36, target.dataset.title || "Tidsserie", "ra-title"));
    for (let i = 0; i <= 4; i += 1) {
      const y = scale(i, 0, 4, bottom, top);
      node.appendChild(el("line", { x1: left, y1: y, x2: right, y2: y, class: "ra-grid" }));
      node.appendChild(text(18, y + 4, fmt.format(scale(i, 0, 4, min, max)), "ra-label"));
    }
    years.forEach((year, i) => {
      const x = scale(i, 0, years.length - 1, left, right);
      node.appendChild(text(x - 18, 584, year, "ra-label"));
    });
    series.lines.forEach((line, idx) => {
      const d = line.values.map((v, i) => `${i === 0 ? "M" : "L"} ${scale(i, 0, years.length - 1, left, right)} ${scale(v, min, max, bottom, top)}`).join(" ");
      const color = line.color || [palette.blue, palette.orange, palette.green][idx % 3];
      node.appendChild(el("path", { d, fill: "none", stroke: color, "stroke-width": 4 }));
      line.values.forEach((v, i) => node.appendChild(el("circle", { cx: scale(i, 0, years.length - 1, left, right), cy: scale(v, min, max, bottom, top), r: 6, fill: color })));
      node.appendChild(text(right - 170, top + 24 + idx * 28, line.label, "ra-label", { fill: color }));
    });
    target.replaceChildren(node);
  }

  function renderRadar(target, data) {
    const node = svg(980, 720);
    const cx = 490;
    const cy = 370;
    const radius = 250;
    const axes = data.axes;
    node.appendChild(text(24, 36, target.dataset.title || "Modenhetsprofil", "ra-title"));
    [0.25, 0.5, 0.75, 1].forEach((ring) => {
      const points = axes.map((_, i) => {
        const a = -Math.PI / 2 + (Math.PI * 2 * i) / axes.length;
        return `${cx + Math.cos(a) * radius * ring},${cy + Math.sin(a) * radius * ring}`;
      }).join(" ");
      node.appendChild(el("polygon", { points, fill: "none", stroke: palette.grid }));
    });
    axes.forEach((axis, i) => {
      const a = -Math.PI / 2 + (Math.PI * 2 * i) / axes.length;
      const x = cx + Math.cos(a) * radius;
      const y = cy + Math.sin(a) * radius;
      node.appendChild(el("line", { x1: cx, y1: cy, x2: x, y2: y, class: "ra-grid" }));
      node.appendChild(text(cx + Math.cos(a) * (radius + 36) - 44, cy + Math.sin(a) * (radius + 36), axis, "ra-label"));
    });
    data.series.forEach((series, idx) => {
      const points = series.values.map((v, i) => {
        const a = -Math.PI / 2 + (Math.PI * 2 * i) / axes.length;
        return `${cx + Math.cos(a) * radius * (v / 100)},${cy + Math.sin(a) * radius * (v / 100)}`;
      }).join(" ");
      const color = series.color || [palette.blue, palette.orange][idx % 2];
      node.appendChild(el("polygon", { points, fill: color, opacity: "0.16", stroke: color, "stroke-width": 3 }));
      node.appendChild(text(32, 654 + idx * 24, series.label, "ra-label", { fill: color }));
    });
    target.replaceChildren(node);
  }

  function boot() {
    const raw = document.getElementById("article-data");
    if (!raw) return;
    const data = JSON.parse(raw.textContent);
    document.querySelectorAll("[data-chart]").forEach((target) => {
      const key = target.dataset.chart;
      const chart = data.charts[key];
      if (!chart) return;
      if (chart.type === "bars") renderBars(target, chart.data);
      if (chart.type === "quadrant") renderQuadrant(target, chart.data);
      if (chart.type === "heatmap") renderHeatmap(target, chart.data);
      if (chart.type === "line") renderLine(target, chart.data);
      if (chart.type === "radar") renderRadar(target, chart.data);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
