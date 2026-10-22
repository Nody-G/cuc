/**
 * FEUILLE DE STYLE DU DOSSIER DE PRÉSENTATION CUC
 * ===============================================
 *
 * Responsabilité :
 *   Fournir l'intégralité du design system CSS autonome (sans dépendance externe) :
 *   grille, typographie, cartes, barres comparatives animées, schémas SVG,
 *   barre de recherche collante, animations natives et mode impression PDF.
 */

export const DOSSIER_STYLES = `
  :root {
    color-scheme: dark;
    --bg: #060609; --surface: #0d0d13; --surface-2: #12121b;
    --border: #252532; --border-hover: #3d3d50;
    --gold: #FFE500; --gold-soft: rgba(255, 229, 0, 0.09);
    --green: #4ade80; --blue: #38bdf8; --amber: #fbbf24;
    --text: #ececf1; --muted: #9a9aa8;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    background: radial-gradient(1100px 520px at 85% -60px, rgba(255,229,0,.07), transparent 70%), var(--bg);
    color: var(--text);
    font: 15px/1.68 Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  :focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; border-radius: 4px; }
  .wrap { max-width: 1220px; margin: 0 auto; padding: 44px 24px 104px; }
  header.hero { padding: 32px 0 28px; border-bottom: 1px solid var(--border); margin-bottom: 28px; position: relative; }
  .hero-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .kicker {
    display: inline-flex; align-items: center; gap: 8px; color: var(--gold); font-size: 11.5px; letter-spacing: .18em;
    text-transform: uppercase; font-weight: 700; background: var(--gold-soft); border: 1px solid rgba(255,229,0,.28);
    border-radius: 999px; padding: 4px 13px;
  }
  .kicker-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 10px var(--green); }
  h1 { font-size: clamp(30px, 4.3vw, 48px); margin: 14px 0 10px; line-height: 1.1; letter-spacing: -.02em; }
  h1 em {
    font-style: normal; background: linear-gradient(100deg, #FFE500, #fff7c2, #FFE500); background-size: 220% 100%;
    -webkit-background-clip: text; background-clip: text; color: transparent; animation: sheen 7s linear infinite;
  }
  @keyframes sheen { to { background-position: -220% 0; } }
  .hero-lead { color: #c7c7d2; font-size: 16.5px; max-width: 880px; margin: 0 0 18px; }
  .meta { color: var(--muted); font-size: 13.5px; max-width: 880px; }

  /* --- Barre d'outils et recherche instantanée --- */
  .toolbar {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    margin-top: 18px; padding: 12px 14px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
  }
  .search-wrap { position: relative; flex: 1 1 280px; }
  .search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; stroke: var(--muted); fill: none; stroke-width: 2; }
  .search-input {
    width: 100%; background: #08080c; color: #fff; border: 1px solid var(--border);
    border-radius: 10px; padding: 9px 14px 9px 36px; font-size: 13.5px;
  }
  .search-input:focus { border-color: var(--gold); outline: none; }
  .search-status { font-size: 12px; color: var(--gold); margin-left: 4px; display: none; }
  .btn {
    display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700;
    color: #111; background: var(--gold); border: 0; border-radius: 999px;
    padding: 8px 16px; cursor: pointer; text-decoration: none; transition: transform .15s ease, opacity .15s ease;
  }
  .btn:hover { transform: translateY(-1px); }
  .btn.ghost { background: #14141d; color: var(--text); border: 1px solid var(--border-hover); font-weight: 600; }
  .btn.ghost:hover { border-color: var(--gold); color: var(--gold); }

  /* --- Bandeau défilant --- */
  .strip {
    overflow: hidden; margin-top: 18px;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  }
  .strip-inner {
    display: flex; align-items: center; gap: 26px; padding: 10px 0;
    white-space: nowrap; width: max-content; color: #c4c4cf; font-size: 12.5px; font-weight: 500;
    animation: slideZ 48s linear infinite;
  }
  .strip-inner .sep { color: var(--gold); font-size: 9px; }
  @keyframes slideZ { to { transform: translateX(-50%); } }

  /* --- Sommaire collant --- */
  nav.toc {
    display: flex; flex-wrap: wrap; gap: 6px; margin: 18px 0 0;
    position: sticky; top: 8px; z-index: 30; padding: 9px 12px;
    background: rgba(9, 9, 14, 0.88); border: 1px solid var(--border); border-radius: 14px;
    backdrop-filter: blur(10px);
  }
  nav.toc a {
    font-size: 11.8px; color: #d0d0da; border: 1px solid #292938; border-radius: 999px;
    padding: 4px 11px; text-decoration: none; background: #0e0e15;
    transition: border-color .15s ease, color .15s ease, background .15s ease;
  }
  nav.toc a:hover, nav.toc a.active { border-color: var(--gold); color: var(--gold); background: #19180d; }

  /* --- Titres & sections --- */
  section { scroll-margin-top: 96px; }
  h2 {
    margin-top: 68px; margin-bottom: 14px; font-size: 25px; letter-spacing: -.01em;
    border-left: 4px solid var(--gold); padding-left: 14px; color: #fff;
  }
  h3 { margin-top: 34px; margin-bottom: 10px; font-size: 18px; color: #f4f4f8; }
  h3 .meta { font-size: 12.5px; font-weight: 400; }
  p { color: #c9c9d4; margin: 10px 0; }
  a { color: var(--gold); }
  .lead { font-size: 16.5px; color: #e0e0e8; max-width: 900px; }

  /* --- Cartes KPI & fonctionnalités --- */
  .kpis { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); margin-top: 20px; }
  .kpi {
    background: linear-gradient(180deg, #12121b 0%, #0b0b11 100%);
    border: 1px solid var(--border); border-radius: 14px; padding: 16px 18px;
    transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
  }
  .kpi:hover { transform: translateY(-3px); border-color: var(--border-hover); box-shadow: 0 14px 32px rgba(0,0,0,.45); }
  .kpi .n { font-size: 29px; font-weight: 800; color: #fff; letter-spacing: -.02em; }
  .kpi .n span.done { display: inline-block; animation: pop .42s ease; }
  @keyframes pop { 50% { transform: scale(1.14); color: var(--gold); } }
  .kpi .l { font-size: 13px; font-weight: 600; color: #e5e5ec; margin-top: 3px; }
  .kpi .s { font-size: 11.5px; color: #8c8c9a; margin-top: 3px; line-height: 1.4; }

  .feat-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(285px, 1fr)); margin-top: 16px; }
  .feat {
    background: linear-gradient(180deg, #11111a 0%, #0c0c12 100%);
    border: 1px solid var(--border); border-radius: 14px; padding: 20px;
    position: relative; overflow: hidden;
    transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
  }
  .feat:hover { transform: translateY(-3px); border-color: var(--border-hover); box-shadow: 0 14px 34px rgba(0,0,0,.45); }
  .feat::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 2px; background: linear-gradient(90deg, var(--gold), transparent 75%); opacity: .85; }
  .feat-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
  .feat .fi {
    width: 38px; height: 38px; border-radius: 10px;
    background: var(--gold-soft); border: 1px solid rgba(255,229,0,.35);
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .feat-badge {
    font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
    color: #9ee6a8; background: rgba(74,222,128,.1); border: 1px solid rgba(74,222,128,.3);
    padding: 3px 9px; border-radius: 999px;
  }
  .feat h3 { margin: 0 0 6px; font-size: 16px; color: #fff; }
  .feat p { margin: 0; color: #b9b9c6; font-size: 13.5px; }
  .feat .tags { margin-top: 11px; display: flex; flex-wrap: wrap; gap: 6px; }
  .tag {
    font-size: 10.5px; letter-spacing: .04em; text-transform: uppercase;
    color: #ffef9e; border: 1px solid #3d3a1e; background: rgba(255,229,0,.06);
    border-radius: 999px; padding: 2px 9px;
  }
  .fi svg { width: 19px; height: 19px; stroke: var(--gold); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

  /* --- Accordéons & Filtres de groupe --- */
  .filter-pills { display: flex; gap: 7px; flex-wrap: wrap; margin: 14px 0; }
  .filter-pill {
    font-size: 12px; font-weight: 600; color: #cfcfda; background: #101018;
    border: 1px solid var(--border); border-radius: 999px; padding: 5px 13px; cursor: pointer;
  }
  .filter-pill:hover, .filter-pill.active { border-color: var(--gold); color: var(--gold); background: #19180d; }
  details.acc {
    border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
    margin: 8px 0; overflow: hidden; transition: border-color .2s ease;
  }
  details.acc:hover { border-color: var(--border-hover); }
  details.acc summary {
    cursor: pointer; list-style: none; padding: 12px 16px;
    display: flex; align-items: center; gap: 12px; font-weight: 600; color: #eef0f6;
  }
  details.acc summary:hover { background: var(--surface-2); }
  details.acc summary::-webkit-details-marker { display: none; }
  .acc-title-wrap { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  details.acc summary .role { color: var(--muted); font-weight: 400; font-size: 12.5px; }
  .route-pill {
    font-size: 11px; color: #38bdf8; background: rgba(56,189,248,.08);
    border: 1px solid rgba(56,189,248,.24); border-radius: 6px; padding: 1px 7px;
  }
  details.acc summary .chev { margin-left: auto; color: var(--gold); transition: transform .25s ease; flex: 0 0 auto; }
  details.acc[open] summary .chev { transform: rotate(90deg); }
  details.acc .acc-body { padding: 12px 18px 16px; color: #c4c5d0; font-size: 13.8px; border-top: 1px solid #1c1c26; }

  /* --- Graphiques comparatifs Avant / Après --- */
  .perf-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); margin-top: 18px; }
  .perf-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; }
  .perf-card h4 { margin: 0 0 4px; font-size: 15px; color: #fff; display: flex; justify-content: space-between; align-items: center; }
  .perf-gain { font-size: 12px; font-weight: 800; color: #111; background: var(--green); border-radius: 999px; padding: 2px 10px; }
  .perf-sub { font-size: 12px; color: var(--muted); margin-bottom: 12px; }
  .bar-row { margin: 9px 0; }
  .bar-meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #d0d0dc; }
  .bar-track { height: 10px; background: #191924; border-radius: 999px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 999px; transform-origin: left; animation: barGrow 1.1s cubic-bezier(.2,.8,.2,1) both; }
  .bar-fill.before { background: #525266; }
  .bar-fill.after { background: linear-gradient(90deg, var(--gold), var(--green)); }
  @keyframes barGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

  /* --- Schémas, tableaux & callouts --- */
  .flow {
    background: radial-gradient(640px 260px at 18% 0%, rgba(255,229,0,.05), transparent), #0a0a10;
    border: 1px solid var(--border); border-radius: 16px; padding: 14px 16px; margin-top: 14px;
  }
  .chart { width: 100%; height: auto; display: block; }
  .donut-wrap { display: flex; gap: 26px; align-items: center; flex-wrap: wrap; margin-top: 12px; }
  .donut-total { fill: #fff; font-size: 22px; font-weight: 800; }
  .legend { list-style: none; margin: 0; padding: 0; font-size: 13px; color: #c9c9d4; }
  .legend li { margin: 5px 0; }
  .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-top: 12px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #1e1e28; vertical-align: top; }
  th { color: var(--muted); font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: .06em; }
  td { color: #d8d8e2; }
  .legend-row { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 10px; font-size: 12px; color: var(--muted); }
  .key { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
  @media (max-width: 920px) { .two-col { grid-template-columns: 1fr; } }
  .callout {
    border-left: 4px solid var(--gold); background: #101018;
    padding: 14px 18px; border-radius: 0 10px 10px 0; margin: 20px 0; color: #dcdce6;
  }
  .map-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(215px, 1fr)); margin-top: 14px; }
  .map-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px 18px; }
  .map-card h4 { margin: 8px 0; font-size: 14.5px; color: #fff; }
  .map-card ul { margin: 0; padding-left: 18px; color: #b9b9c6; font-size: 12.8px; }
  .map-card li { margin: 4px 0; }
  .steps { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(165px, 1fr)); margin-top: 14px; }
  .step { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px; position: relative; }
  .step .num { display: inline-flex; width: 24px; height: 24px; border-radius: 50%; background: var(--gold); color: #111; font-weight: 800; font-size: 12.5px; align-items: center; justify-content: center; margin-bottom: 8px; }
  .step h4 { margin: 0 0 4px; font-size: 14px; color: #fff; }
  .step p { margin: 0; font-size: 12.5px; color: #a9aab4; }
  ul.sessions { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 8px; }
  .sess { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; }
  .sess-status { font-size: 10.5px; text-transform: uppercase; letter-spacing: .05em; border-radius: 999px; padding: 3px 10px; border: 1px solid #3a3a44; white-space: nowrap; }
  .s-ok { color: #9ee6a8; border-color: #2e5533; background: rgba(129,199,132,.08); }
  .s-last { color: #ffd28a; border-color: #5a4620; background: rgba(255,176,32,.08); }
  .s-full { color: #ff9d8a; border-color: #5c3128; background: rgba(255,112,67,.08); }
  .s-soon { color: #b9c6d8; border-color: #333c47; background: rgba(79,195,247,.06); }
  .sess-title { font-weight: 600; color: #eef0f4; }
  .sess-date { margin-left: auto; color: var(--muted); font-size: 13px; }
  .thread { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 10px; }
  .thread li { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--gold); border-radius: 0 10px 10px 0; padding: 12px 16px; color: #c9c9d4; font-size: 13.5px; }
  .thread b { color: #fff; }
  footer { margin-top: 76px; border-top: 1px solid var(--border); padding-top: 22px; color: #8c8c9a; font-size: 12.5px; }
  .pill { display: inline-block; font-size: 11px; padding: 2px 9px; border: 1px solid #3a3a44; border-radius: 999px; color: #c9c9d1; margin-right: 6px; }
  code { color: #ffe9a8; font-size: 12.5px; }

  /* --- Animations SVG --- */
  .flowline { fill: none; stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 4 12; animation: march 1.4s linear infinite; }
  @keyframes march { to { stroke-dashoffset: -16; } }
  .halo { animation: haloPulse 4.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes haloPulse { 0%, 100% { opacity: .14; transform: scale(.96); } 50% { opacity: .42; transform: scale(1.04); } }
  .flowmsg { offset-rotate: 0deg; animation: msgRun 10.5s linear infinite; filter: drop-shadow(0 4px 10px rgba(255,229,0,.28)); }
  @keyframes msgRun { 0% { offset-distance: 0%; opacity: 0; } 3% { opacity: 1; } 88% { offset-distance: 100%; opacity: 1; } 95%, 100% { offset-distance: 100%; opacity: 0; } }
  .rc-node { animation: nodeHit 10.5s linear infinite; }
  @keyframes nodeHit { 0%, 10% { stroke: #FFE500; stroke-width: 3.2; } 22%, 100% { stroke: #3a3a44; stroke-width: 2; } }
  .rc-ping { fill: none; stroke: #FFE500; stroke-width: 2; opacity: 0; transform-box: fill-box; transform-origin: center; animation: pingOut 10.5s ease-out infinite; }
  @keyframes pingOut { 0% { transform: scale(.6); opacity: .8; } 10% { transform: scale(1.7); opacity: 0; } 10.01%, 100% { opacity: 0; } }
  .rc-fill { fill: none; stroke: #FFE500; stroke-width: 2; stroke-dasharray: 700; stroke-dashoffset: 700; animation: lineFill 10.5s linear infinite; }
  @keyframes lineFill { 0% { stroke-dashoffset: 700; opacity: .85; } 88% { stroke-dashoffset: 0; opacity: .85; } 93%, 100% { stroke-dashoffset: 700; opacity: 0; } }
  .jdraw { fill: none; stroke: #FFE500; stroke-width: 2.6; stroke-linecap: round; stroke-dasharray: 2300; stroke-dashoffset: 2300; animation: jDraw 16s linear infinite; }
  @keyframes jDraw { 0% { stroke-dashoffset: 2300; opacity: .9; } 94% { stroke-dashoffset: 0; opacity: .9; } 100% { stroke-dashoffset: 0; opacity: 0; } }
  .jtoken { offset-rotate: 0deg; animation: jToken 16s linear infinite; filter: drop-shadow(0 6px 16px rgba(255,229,0,.4)); }
  @keyframes jToken { 0% { offset-distance: 0%; opacity: 0; } 3% { opacity: 1; } 95% { offset-distance: 100%; opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
  .jnode { animation: jNode 16s linear infinite; }
  @keyframes jNode { 0%, 10% { stroke: #FFE500; stroke-width: 3.4; } 16%, 100% { stroke: #3a3a44; stroke-width: 2; } }
  .jring { fill: none; stroke: #FFE500; stroke-width: 2; opacity: 0; transform-box: fill-box; transform-origin: center; animation: jRing 16s ease-out infinite; }
  @keyframes jRing { 0% { transform: scale(.7); opacity: .85; } 6% { transform: scale(1.9); opacity: 0; } 6.01%, 100% { opacity: 0; } }

  .totop {
    position: fixed; right: 18px; bottom: 18px; z-index: 40; width: 42px; height: 42px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; background: #0e0e14; border: 1px solid #3a3a44;
    color: var(--gold); text-decoration: none; font-size: 18px; box-shadow: 0 10px 24px rgba(0,0,0,.45);
  }
  .totop:hover { border-color: var(--gold); }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .flowline, .halo, .flowmsg, .rc-node, .rc-ping, .rc-fill, .jdraw, .jtoken, .jnode, .jring,
    .strip-inner, h1 em, .kpi .n span.done, .bar-fill { animation: none !important; }
    .jdraw { stroke-dashoffset: 0; opacity: .9; }
  }
  @media print {
    body { background: #fff; color: #111; }
    .feat, .kpi, .step, .map-card, .sess, .perf-card { border-color: #ddd; background: #fff; box-shadow: none; }
    nav.toc, .totop, .toolbar, .strip { display: none; }
    details.acc { break-inside: avoid; }
    details.acc .acc-body { display: block; }
  }
`;
