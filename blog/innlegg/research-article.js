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
    const node = svg(760, 430);
    const max = Math.max(...data.map((d) => d.value));
    const left = 172;
    const top = 48;
    const rowH = 42;
    node.appendChild(text(20, 26, target.dataset.title || "Rangert sammenligning", "ra-title"));
    [0, 25, 50, 75, 100].forEach((tick) => {
      const x = scale(tick, 0, 100, left, 720);
      node.appendChild(el("line", { x1: x, y1: top - 18, x2: x, y2: 378, class: "ra-grid" }));
      node.appendChild(text(x - 8, 402, `${tick}%`, "ra-label"));
    });
    data.forEach((d, i) => {
      const y = top + i * rowH;
      const w = scale(d.value, 0, Math.max(max, 100), 0, 548);
      const fill = d.color || (d.value >= 70 ? palette.green : d.value >= 40 ? palette.orange : palette.red);
      node.appendChild(text(20, y + 20, d.label, "ra-label"));
      node.appendChild(el("rect", { x: left, y, width: 548, height: 24, rx: 6, fill: "rgba(255,255,255,0.045)" }));
      node.appendChild(el("rect", { x: left, y, width: w, height: 24, rx: 6, fill }));
      node.appendChild(text(left + Math.max(8, w - 45), y + 17, `${fmt.format(d.value)}${d.suffix || "%"}`, "ra-value"));
    });
    target.replaceChildren(node);
  }

  function renderQuadrant(target, data) {
    const node = svg(760, 520);
    const left = 72;
    const right = 720;
    const top = 48;
    const bottom = 450;
    node.appendChild(text(22, 26, target.dataset.title || "Prioriteringskart", "ra-title"));
    for (let i = 0; i <= 4; i += 1) {
      const x = scale(i, 0, 4, left, right);
      const y = scale(i, 0, 4, bottom, top);
      node.appendChild(el("line", { x1: x, y1: top, x2: x, y2: bottom, class: "ra-grid" }));
      node.appendChild(el("line", { x1: left, y1: y, x2: right, y2: y, class: "ra-grid" }));
    }
    node.appendChild(el("line", { x1: left, y1: scale(50, 0, 100, bottom, top), x2: right, y2: scale(50, 0, 100, bottom, top), stroke: "rgba(214,155,98,0.42)", "stroke-dasharray": "6 7" }));
    node.appendChild(el("line", { x1: scale(50, 0, 100, left, right), y1: top, x2: scale(50, 0, 100, left, right), y2: bottom, stroke: "rgba(214,155,98,0.42)", "stroke-dasharray": "6 7" }));
    node.appendChild(text(left, 492, target.dataset.x || "Lav", "ra-label"));
    node.appendChild(text(right - 100, 492, target.dataset.xmax || "Høy", "ra-label"));
    node.appendChild(text(16, top + 8, target.dataset.ymax || "Høy", "ra-label"));
    data.forEach((d) => {
      const x = scale(d.x, 0, 100, left, right);
      const y = scale(d.y, 0, 100, bottom, top);
      const r = scale(d.size || 20, 0, 100, 8, 28);
      node.appendChild(el("circle", { cx: x, cy: y, r, fill: d.color || palette.blue, opacity: "0.72", stroke: "rgba(255,255,255,0.7)" }));
      node.appendChild(text(x + r + 6, y + 4, d.label, "ra-label"));
    });
    target.replaceChildren(node);
  }

  function renderHeatmap(target, data) {
    const node = svg(760, 420);
    const cols = data.cols;
    const rows = data.rows;
    const left = 170;
    const top = 62;
    const cellW = 112;
    const cellH = 58;
    node.appendChild(text(20, 28, target.dataset.title || "Risikomatrise", "ra-title"));
    cols.forEach((col, i) => node.appendChild(text(left + i * cellW + 8, 48, col, "ra-label")));
    rows.forEach((row, r) => node.appendChild(text(18, top + r * cellH + 34, row, "ra-label")));
    data.values.forEach((row, r) => {
      row.forEach((v, c) => {
        const fill = v >= 75 ? palette.red : v >= 55 ? palette.orange : v >= 35 ? palette.yellow : palette.green;
        node.appendChild(el("rect", { x: left + c * cellW, y: top + r * cellH, width: cellW - 6, height: cellH - 6, rx: 8, fill, opacity: scale(v, 0, 100, 0.22, 0.9) }));
        node.appendChild(text(left + c * cellW + 34, top + r * cellH + 33, v, "ra-value"));
      });
    });
    target.replaceChildren(node);
  }

  function renderLine(target, series) {
    const node = svg(760, 430);
    const left = 64;
    const right = 720;
    const top = 48;
    const bottom = 354;
    const years = series.years;
    const all = series.lines.flatMap((line) => line.values);
    const min = Math.min(0, ...all);
    const max = Math.max(...all);
    node.appendChild(text(20, 26, target.dataset.title || "Tidsserie", "ra-title"));
    for (let i = 0; i <= 4; i += 1) {
      const y = scale(i, 0, 4, bottom, top);
      node.appendChild(el("line", { x1: left, y1: y, x2: right, y2: y, class: "ra-grid" }));
      node.appendChild(text(18, y + 4, fmt.format(scale(i, 0, 4, min, max)), "ra-label"));
    }
    years.forEach((year, i) => {
      const x = scale(i, 0, years.length - 1, left, right);
      node.appendChild(text(x - 14, 392, year, "ra-label"));
    });
    series.lines.forEach((line, idx) => {
      const d = line.values.map((v, i) => `${i === 0 ? "M" : "L"} ${scale(i, 0, years.length - 1, left, right)} ${scale(v, min, max, bottom, top)}`).join(" ");
      const color = line.color || [palette.blue, palette.orange, palette.green][idx % 3];
      node.appendChild(el("path", { d, fill: "none", stroke: color, "stroke-width": 3 }));
      line.values.forEach((v, i) => node.appendChild(el("circle", { cx: scale(i, 0, years.length - 1, left, right), cy: scale(v, min, max, bottom, top), r: 4, fill: color })));
      node.appendChild(text(right - 120, top + 20 + idx * 22, line.label, "ra-label", { fill: color }));
    });
    target.replaceChildren(node);
  }

  function renderRadar(target, data) {
    const node = svg(620, 520);
    const cx = 310;
    const cy = 260;
    const radius = 174;
    const axes = data.axes;
    node.appendChild(text(20, 28, target.dataset.title || "Modenhetsprofil", "ra-title"));
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
      node.appendChild(text(cx + Math.cos(a) * (radius + 24) - 34, cy + Math.sin(a) * (radius + 24), axis, "ra-label"));
    });
    data.series.forEach((series, idx) => {
      const points = series.values.map((v, i) => {
        const a = -Math.PI / 2 + (Math.PI * 2 * i) / axes.length;
        return `${cx + Math.cos(a) * radius * (v / 100)},${cy + Math.sin(a) * radius * (v / 100)}`;
      }).join(" ");
      const color = series.color || [palette.blue, palette.orange][idx % 2];
      node.appendChild(el("polygon", { points, fill: color, opacity: "0.16", stroke: color, "stroke-width": 3 }));
      node.appendChild(text(24, 470 + idx * 20, series.label, "ra-label", { fill: color }));
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
