#!/usr/bin/env node
/**
 * Script de génération du dossier HTML interactif et exécutif pour Lucas Dollfus
 * Source : plans/propositions-descriptions-20-coachs.md + src/data/team.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const mdPath = path.resolve('plans/propositions-descriptions-20-coachs.md');
const teamPath = path.resolve('src/data/team.ts');
const outHtmlPath = path.resolve('plans/Dossier_Selection_Biographies_Coachs_CUC.html');
const outMdPath = path.resolve('plans/propositions-descriptions-20-coachs.md');

const mdContent = fs.readFileSync(mdPath, 'utf8');
const teamContent = fs.readFileSync(teamPath, 'utf8');

const teamMatch = teamContent.match(/export const CUC_TEAM:\s*Instructor\[\]\s*=\s*(\[[\s\S]*?\]);/);
if (!teamMatch) {
  console.error('❌ Impossible d’extraire CUC_TEAM de src/data/team.ts');
  process.exit(1);
}
const teamData = JSON.parse(teamMatch[1]);
const teamMap = new Map(teamData.map(c => [c.name.toLowerCase().trim(), c]));

// Parser les 20 coachs et leurs 5 options
const regex = /##\s+(\d+)\.\s+([^\n\r]+)\r?\n\*([^\*\n\r]+)\*\r?\n\r?\n\*\s+\*\*Option 1[^\:]*:\*\*\s*\r?\n\s*([\s\S]*?)\r?\n\r?\n\*\s+\*\*Option 2[^\:]*:\*\*\s*\r?\n\s*([\s\S]*?)\r?\n\r?\n\*\s+\*\*Option 3[^\:]*:\*\*\s*\r?\n\s*([\s\S]*?)\r?\n\r?\n\*\s+\*\*Option 4[^\:]*:\*\*\s*\r?\n\s*([\s\S]*?)\r?\n\r?\n\*\s+\*\*Option 5[^\:]*:\*\*\s*\r?\n\s*([\s\S]*?)(?=\r?\n\r?\n---|$)/g;

const coaches = [];
let match;
while ((match = regex.exec(mdContent)) !== null) {
  const index = parseInt(match[1], 10);
  const name = match[2].trim();
  const subline = match[3].trim();
  const opt1 = match[4].trim();
  const opt2 = match[5].trim();
  const opt3 = match[6].trim();
  const opt4 = match[7].trim();
  const opt5 = match[8].trim();

  // Chercher dans teamMap
  let meta = teamMap.get(name.toLowerCase());
  if (!meta) {
    for (const [k, v] of teamMap.entries()) {
      if (name.toLowerCase().includes(k) || k.includes(name.toLowerCase())) {
        meta = v;
        break;
      }
    }
  }

  coaches.push({
    index,
    name,
    id: meta ? meta.id : name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    subline,
    role: meta ? meta.role : subline.split('—')[0]?.trim(),
    title: meta ? meta.title : subline.split('—')[1]?.trim(),
    avatarUrl: meta ? meta.avatarUrl : null,
    specialties: meta ? meta.specialties : [],
    options: [
      { id: 1, title: 'Option 1 : Parcours, Racines & Vocation', theme: 'Parcours', badge: 'Narratif & Humain', color: '#38bdf8', text: opt1 },
      { id: 2, title: 'Option 2 : Plateau, Réalisations & Tournages', theme: 'Plateau', badge: 'Cinéma & Tournages', color: '#f59e0b', text: opt2 },
      { id: 3, title: 'Option 3 : Pédagogie, Méthode & Transmission CUC', theme: 'Pédagogie', badge: 'Campus & Formation', color: '#10b981', text: opt3 },
      { id: 4, title: 'Option 4 : Synthèse Complète 360°', theme: 'Synthèse 360°', badge: 'Recommandée', color: '#a855f7', isRecommended: true, text: opt4 },
      { id: 5, title: 'Option 5 : Signature Technique & Vision Métier', theme: 'Expertise', badge: 'Technique Pointue', color: '#ec4899', text: opt5 }
    ]
  });
}

console.log(`✓ ${coaches.length} coachs extraits avec succès.`);

// Générer le HTML autonome ultra-soigné
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CUC — Dossier de Sélection des Biographies des 20 Coachs</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0e14;
      --bg-alt: #101520;
      --surface: #141b27;
      --surface-card: #192231;
      --surface-hover: #202b3e;
      --border: #222e42;
      --border-focus: #f59e0b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --gold: #f59e0b;
      --gold-dark: #b45309;
      --gold-light: #fbbf24;
      --opt1: #38bdf8;
      --opt2: #f59e0b;
      --opt3: #10b981;
      --opt4: #a855f7;
      --opt5: #ec4899;
      --radius: 12px;
      --radius-sm: 8px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      padding-bottom: 120px;
    }

    /* HEADER */
    .hero-header {
      background: linear-gradient(180deg, #161e2e 0%, var(--bg) 100%);
      border-bottom: 1px solid var(--border);
      padding: 40px 24px 32px;
      position: sticky;
      top: 0;
      z-index: 40;
      backdrop-filter: blur(12px);
    }

    .hero-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .hero-titles {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .badge-cuc {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 9999px;
      color: var(--gold-light);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      width: fit-content;
    }

    .hero-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.85rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .hero-subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
      max-width: 750px;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: var(--radius-sm);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      text-decoration: none;
    }

    .btn-gold {
      background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
      color: #0b0e14;
      border-color: rgba(245, 158, 11, 0.4);
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
    }
    .btn-gold:hover {
      background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 100%);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--surface-card);
      color: var(--text);
      border-color: var(--border);
    }
    .btn-secondary:hover {
      background: var(--surface-hover);
      border-color: #3b4b66;
    }

    /* MAIN LAYOUT */
    .app-layout {
      max-width: 1400px;
      margin: 28px auto 0;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 310px 1fr;
      gap: 32px;
      align-items: start;
    }

    @media (max-width: 1024px) {
      .app-layout {
        grid-template-columns: 1fr;
      }
    }

    /* SIDEBAR */
    .sidebar-panel {
      position: sticky;
      top: 170px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: calc(100vh - 200px);
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }

    .sidebar-title {
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text);
    }

    .progress-badge {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 2px 8px;
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 999px;
    }

    .progress-bar-container {
      width: 100%;
      height: 6px;
      background: #1e293b;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #10b981, #f59e0b);
      transition: width 0.3s ease;
    }

    .search-input {
      width: 100%;
      padding: 8px 12px;
      background: var(--bg-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: #fff;
      font-size: 0.85rem;
      outline: none;
    }
    .search-input:focus {
      border-color: var(--gold);
    }

    .coach-nav-list {
      list-style: none;
      overflow-y: auto;
      padding-right: 4px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .coach-nav-list::-webkit-scrollbar {
      width: 4px;
    }
    .coach-nav-list::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 2px;
    }

    .coach-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 10px;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.15s ease;
      position: relative;
    }

    .coach-nav-item:hover {
      background: var(--surface-card);
      color: #fff;
    }

    .coach-nav-item.active {
      background: rgba(245, 158, 11, 0.12);
      color: var(--gold-light);
      font-weight: 600;
    }

    .coach-nav-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
      background: #2a3649;
    }

    .coach-nav-tag {
      margin-left: auto;
      font-size: 0.7rem;
      padding: 1px 6px;
      border-radius: 4px;
      background: #2a3649;
      color: var(--text-dim);
      font-weight: 600;
    }

    .coach-nav-item.has-selection .coach-nav-tag {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }

    /* COACH MAIN LIST */
    .coaches-stream {
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    .coach-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      scroll-margin-top: 150px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      transition: border-color 0.2s ease;
    }

    .coach-card:hover {
      border-color: #374660;
    }

    .coach-card.has-choice {
      border-color: rgba(245, 158, 11, 0.4);
    }

    /* COACH HEADER */
    .coach-header {
      background: var(--surface-card);
      padding: 24px;
      display: flex;
      gap: 20px;
      align-items: center;
      border-bottom: 1px solid var(--border);
      position: relative;
    }

    .coach-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--border);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      background: #1e293b;
      flex-shrink: 0;
    }

    .coach-meta {
      flex-grow: 1;
    }

    .coach-num {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--gold);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .coach-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.55rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .coach-roles {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .coach-specialties {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .spec-pill {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-muted);
    }

    .coach-selected-badge {
      display: none;
      position: absolute;
      top: 24px;
      right: 24px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid var(--gold);
      color: var(--gold-light);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      align-items: center;
      gap: 6px;
    }

    .coach-card.has-choice .coach-selected-badge {
      display: inline-flex;
    }

    /* COACH TABS / OPTIONS */
    .options-nav {
      display: flex;
      background: var(--bg-alt);
      border-bottom: 1px solid var(--border);
      overflow-x: auto;
      padding: 0 12px;
    }

    .option-tab-btn {
      padding: 12px 16px;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 2px solid transparent;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .option-tab-btn:hover {
      color: #fff;
    }

    .option-tab-btn.active {
      color: #fff;
      border-bottom-color: var(--tab-color, var(--gold));
      background: rgba(255, 255, 255, 0.02);
    }

    .option-tab-badge {
      font-size: 0.68rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-dim);
    }

    .option-tab-btn.active .option-tab-badge {
      background: var(--tab-color);
      color: #0b0e14;
    }

    .options-content {
      padding: 24px;
    }

    .option-pane {
      display: none;
      flex-direction: column;
      gap: 16px;
      animation: fadeIn 0.2s ease-in-out;
    }

    .option-pane.active {
      display: flex;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .option-meta-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .option-title-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .option-badge-tag {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .option-name-label {
      font-weight: 700;
      font-size: 1rem;
      color: #ffffff;
    }

    .option-stats {
      font-size: 0.8rem;
      color: var(--text-dim);
    }

    .option-text-box {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 20px 22px;
      font-size: 1.02rem;
      line-height: 1.75;
      color: #e2e8f0;
      transition: all 0.2s ease;
      position: relative;
    }

    .option-pane.is-selected .option-text-box {
      border-color: var(--gold);
      background: rgba(245, 158, 11, 0.04);
      box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.3);
    }

    .option-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      padding-top: 6px;
    }

    .btn-select-option {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
      padding: 8px 18px;
      border-radius: var(--radius-sm);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .btn-select-option:hover {
      background: #334155;
      color: #fff;
    }

    .option-pane.is-selected .btn-select-option {
      background: var(--gold);
      color: #0b0e14;
      border-color: var(--gold-light);
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
    }

    /* NOTES / AJOUTS */
    .custom-note-wrap {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed var(--border);
    }

    .custom-note-toggle {
      font-size: 0.8rem;
      color: var(--text-dim);
      background: none;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      text-decoration: underline;
    }
    .custom-note-toggle:hover {
      color: var(--text-muted);
    }

    .custom-note-textarea {
      width: 100%;
      margin-top: 8px;
      background: var(--bg-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 8px 12px;
      color: #fff;
      font-size: 0.85rem;
      min-height: 60px;
      display: none;
      outline: none;
      font-family: inherit;
    }
    .custom-note-textarea:focus {
      border-color: var(--gold);
    }
    .custom-note-textarea.open {
      display: block;
    }

    /* STICKY BOTTOM BAR */
    .sticky-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(16, 21, 32, 0.95);
      border-top: 1px solid var(--border);
      backdrop-filter: blur(16px);
      padding: 16px 24px;
      z-index: 50;
      box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.6);
    }

    .sticky-bar-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .sticky-status {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .sticky-status-text {
      font-size: 0.92rem;
      font-weight: 600;
      color: #fff;
    }

    .sticky-counter {
      color: var(--gold);
      font-weight: 800;
    }

    .sticky-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* MODAL RÉCAPITULATIF */
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .modal-backdrop.open {
      display: flex;
    }

    .modal-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      width: 100%;
      max-width: 780px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.3rem;
      color: #fff;
    }

    .modal-close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .modal-summary-textarea {
      width: 100%;
      height: 350px;
      background: var(--bg-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px;
      color: #e2e8f0;
      font-family: monospace;
      font-size: 0.85rem;
      line-height: 1.5;
      resize: none;
      outline: none;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    /* TOAST */
    .toast {
      position: fixed;
      top: 24px;
      right: 24px;
      background: #10b981;
      color: #0b0e14;
      font-weight: 700;
      padding: 12px 20px;
      border-radius: var(--radius-sm);
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      z-index: 200;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.25s ease;
      pointer-events: none;
    }
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    /* PRINT STYLES */
    @media print {
      body {
        background: #fff !important;
        color: #000 !important;
        padding-bottom: 0 !important;
      }
      .hero-header, .sidebar-panel, .sticky-bar, .options-nav, .btn-select-option, .custom-note-wrap {
        display: none !important;
      }
      .app-layout {
        display: block !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .coach-card {
        page-break-inside: avoid;
        border: 1px solid #ccc !important;
        background: #fff !important;
        box-shadow: none !important;
        margin-bottom: 30px !important;
      }
      .coach-header {
        background: #f4f4f4 !important;
        color: #000 !important;
      }
      .coach-name, .coach-num {
        color: #000 !important;
      }
      .option-pane {
        display: block !important;
        margin-bottom: 16px;
      }
      .option-text-box {
        background: #fff !important;
        color: #111 !important;
        border: 1px solid #ddd !important;
      }
    }
  </style>
</head>
<body>

  <!-- HERO HEADER -->
  <header class="hero-header">
    <div class="hero-container">
      <div class="hero-titles">
        <div class="badge-cuc">
          <span>Campus Univers Cascades</span>
          <span>•</span>
          <span>Dossier Direction</span>
        </div>
        <h1 class="hero-title">Recueil des Biographies des 20 Coachs</h1>
        <p class="hero-subtitle">
          Document de travail pour <strong>Lucas Dollfus</strong>. Choisissez pour chaque coach la description la plus fidèle parmi les 5 angles rédigés (Parcours, Plateau, Pédagogie CUC, Synthèse 360°, ou Signature Technique).
        </p>
      </div>

      <div class="hero-actions">
        <button class="btn btn-secondary" onclick="selectAllOption(4)">
          <span>⚡ Tout mettre en Option 4 (Recommandée)</span>
        </button>
        <button class="btn btn-gold" onclick="openSummaryModal()">
          <span>📋 Voir ma sélection & Copier</span>
        </button>
      </div>
    </div>
  </header>

  <!-- APP CONTENT -->
  <div class="app-layout">

    <!-- SIDEBAR -->
    <aside class="sidebar-panel">
      <div class="sidebar-header">
        <span class="sidebar-title">Coachs CUC (20)</span>
        <span class="progress-badge" id="sideProgress">0 / 20 choisis</span>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar-fill" id="progressBar"></div>
      </div>

      <input type="text" class="search-input" id="searchInput" placeholder="Filtrer par nom..." oninput="filterCoaches()">

      <ul class="coach-nav-list" id="coachNavList">
        ${coaches.map(c => `
          <li>
            <a href="#coach-${c.id}" class="coach-nav-item" id="nav-${c.id}" onclick="highlightNav('${c.id}')">
              ${c.avatarUrl ? `<img src="${c.avatarUrl}" class="coach-nav-thumb" alt="${c.name}">` : `<div class="coach-nav-thumb"></div>`}
              <span>${c.index}. ${c.name}</span>
              <span class="coach-nav-tag" id="tag-${c.id}">À choisir</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </aside>

    <!-- STREAM OF COACH CARDS -->
    <main class="coaches-stream" id="coachesStream">
      ${coaches.map(c => `
        <article class="coach-card" id="coach-${c.id}" data-coach-id="${c.id}" data-coach-name="${c.name}">
          
          <!-- CARD HEADER -->
          <div class="coach-header">
            ${c.avatarUrl ? `<img src="${c.avatarUrl}" class="coach-avatar" alt="${c.name}">` : ''}
            <div class="coach-meta">
              <div class="coach-num">Coach #${c.index}</div>
              <h2 class="coach-name">${c.name}</h2>
              <div class="coach-roles"><strong>${c.role}</strong> — ${c.title}</div>
              <div class="coach-specialties">
                ${c.specialties.map(s => `<span class="spec-pill">${s}</span>`).join('')}
              </div>
            </div>
            <div class="coach-selected-badge" id="selectedBadge-${c.id}">
              <span>✓</span>
              <span id="selectedBadgeText-${c.id}">Option choisie</span>
            </div>
          </div>

          <!-- TABS -->
          <nav class="options-nav">
            ${c.options.map((opt, oIdx) => `
              <button 
                class="option-tab-btn ${oIdx === 3 ? 'active' : ''}" 
                style="--tab-color: ${opt.color};" 
                onclick="switchTab('${c.id}', ${opt.id})"
                id="tabBtn-${c.id}-${opt.id}"
              >
                <span>${opt.theme}</span>
                <span class="option-tab-badge" style="${opt.isRecommended ? 'background: #a855f7; color: #fff;' : ''}">${opt.badge}</span>
              </button>
            `).join('')}
          </nav>

          <!-- OPTIONS CONTENT PANES -->
          <div class="options-content">
            ${c.options.map((opt, oIdx) => `
              <div class="option-pane ${oIdx === 3 ? 'active' : ''}" id="pane-${c.id}-${opt.id}">
                
                <div class="option-meta-header">
                  <div class="option-title-wrap">
                    <span class="option-badge-tag" style="background: ${opt.color}20; color: ${opt.color}; border: 1px solid ${opt.color}40;">${opt.badge}</span>
                    <h3 class="option-name-label">${opt.title}</h3>
                  </div>
                  <div class="option-stats">${opt.text.length} caractères • ~${Math.round(opt.text.split(/\\s+/).length)} mots</div>
                </div>

                <div class="option-text-box">
                  ${opt.text}
                </div>

                <div class="option-actions">
                  <button class="btn-select-option" id="btnSelect-${c.id}-${opt.id}" onclick="selectOption('${c.id}', ${opt.id})">
                    <span class="check-icon">○</span>
                    <span class="btn-text">Sélectionner cette version</span>
                  </button>

                  <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 6px 12px;" onclick="copyTextToClipboard('${c.id}-${opt.id}')">
                    <span>📋 Copier ce texte</span>
                  </button>
                </div>

                <div class="custom-note-wrap">
                  <button class="custom-note-toggle" onclick="toggleNote('${c.id}', ${opt.id})">
                    <span>✏️ Ajouter une retouche ou consigne pour cette option...</span>
                  </button>
                  <textarea 
                    class="custom-note-textarea" 
                    id="note-${c.id}-${opt.id}" 
                    placeholder="Note ou ajustement personnel de Lucas (optionnel)..."
                    oninput="saveCustomNote('${c.id}', ${opt.id})"
                  ></textarea>
                </div>

              </div>
            `).join('')}
          </div>

        </article>
      `).join('')}
    </main>

  </div>

  <!-- STICKY FLOATING BOTTOM BAR -->
  <footer class="sticky-bar">
    <div class="sticky-bar-inner">
      <div class="sticky-status">
        <span class="sticky-status-text">
          Validation des fiches : <span class="sticky-counter" id="stickyCount">0 / 20</span>
        </span>
      </div>

      <div class="sticky-actions">
        <button class="btn btn-secondary" onclick="window.print()">
          <span>🖨️ Imprimer / PDF</span>
        </button>
        <button class="btn btn-gold" onclick="openSummaryModal()">
          <span>📋 Valider et Récupérer la Sélection</span>
        </button>
      </div>
    </div>
  </footer>

  <!-- MODAL DE RÉCAPITULATIF -->
  <div class="modal-backdrop" id="summaryModal" onclick="closeSummaryModal(event)">
    <div class="modal-card" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3 class="modal-title">Récapitulatif des choix de Lucas Dollfus</h3>
        <button class="modal-close-btn" onclick="closeSummaryModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size: 0.9rem; color: var(--text-muted);">
          Voici le résumé formaté de votre sélection. Vous pouvez le copier d'un clic pour l'envoyer à Niels par mail ou messagerie, ou le télécharger en fichier texte.
        </p>
        <textarea class="modal-summary-textarea" id="modalSummaryText" readonly></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="downloadSummaryFile()">
          <span>💾 Télécharger (.txt)</span>
        </button>
        <button class="btn btn-gold" onclick="copySummaryText()">
          <span>📋 Copier le Récapitulatif</span>
        </button>
      </div>
    </div>
  </div>

  <!-- TOAST NOTIFICATION -->
  <div class="toast" id="toast">Copié dans le presse-papier !</div>

  <script>
    const COACHES_DATA = ${JSON.stringify(coaches)};
    const STORAGE_KEY = 'cuc_coach_descriptions_selection_v2';
    const NOTES_KEY = 'cuc_coach_descriptions_notes_v2';

    let userSelections = {};
    let userNotes = {};

    // Charger les sélections sauvegardées dans localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) userSelections = JSON.parse(saved);
      const savedNotes = localStorage.getItem(NOTES_KEY);
      if (savedNotes) userNotes = JSON.parse(savedNotes);
    } catch(e) {
      console.warn('LocalStorage non accessible:', e);
    }

    function init() {
      // Appliquer les sélections existantes ou défaut
      COACHES_DATA.forEach(coach => {
        const choice = userSelections[coach.id];
        if (choice) {
          applySelectionUI(coach.id, choice);
        }
        // Restaurer les notes
        for (let optId = 1; optId <= 5; optId++) {
          const noteVal = userNotes[\`\${coach.id}-\${optId}\`];
          if (noteVal) {
            const el = document.getElementById(\`note-\${coach.id}-\${optId}\`);
            if (el) {
              el.value = noteVal;
              el.classList.add('open');
            }
          }
        }
      });
      updateCounter();
    }

    function switchTab(coachId, optionId) {
      // Onglets
      for (let i = 1; i <= 5; i++) {
        const tabBtn = document.getElementById(\`tabBtn-\${coachId}-\${i}\`);
        const pane = document.getElementById(\`pane-\${coachId}-\${i}\`);
        if (tabBtn) tabBtn.classList.toggle('active', i === optionId);
        if (pane) pane.classList.toggle('active', i === optionId);
      }
    }

    function selectOption(coachId, optionId) {
      userSelections[coachId] = optionId;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userSelections));
      } catch(e) {}

      applySelectionUI(coachId, optionId);
      updateCounter();
      showToast('Option ' + optionId + ' sélectionnée pour ' + getCoachName(coachId));
    }

    function applySelectionUI(coachId, optionId) {
      const card = document.getElementById(\`coach-\${coachId}\`);
      if (card) card.classList.add('has-choice');

      const badge = document.getElementById(\`selectedBadge-\${coachId}\`);
      const badgeText = document.getElementById(\`selectedBadgeText-\${coachId}\`);
      if (badge && badgeText) {
        badgeText.textContent = \`Option \${optionId} retenue\`;
      }

      // Marquer le pane sélectionné
      for (let i = 1; i <= 5; i++) {
        const pane = document.getElementById(\`pane-\${coachId}-\${i}\`);
        const btn = document.getElementById(\`btnSelect-\${coachId}-\${i}\`);
        if (pane) pane.classList.toggle('is-selected', i === optionId);
        if (btn) {
          const icon = btn.querySelector('.check-icon');
          const txt = btn.querySelector('.btn-text');
          if (i === optionId) {
            if (icon) icon.textContent = '✓';
            if (txt) txt.textContent = 'Option sélectionnée';
          } else {
            if (icon) icon.textContent = '○';
            if (txt) txt.textContent = 'Sélectionner cette version';
          }
        }
      }

      // Sidebar tag
      const navItem = document.getElementById(\`nav-\${coachId}\`);
      const navTag = document.getElementById(\`tag-\${coachId}\`);
      if (navItem && navTag) {
        navItem.classList.add('has-selection');
        navTag.textContent = \`Opt \${optionId}\`;
      }
    }

    function selectAllOption(optionId) {
      COACHES_DATA.forEach(coach => {
        userSelections[coach.id] = optionId;
        applySelectionUI(coach.id, optionId);
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userSelections));
      } catch(e) {}
      updateCounter();
      showToast(\`Tous les coachs configurés en Option \${optionId} !\`);
    }

    function updateCounter() {
      const total = COACHES_DATA.length;
      const count = Object.keys(userSelections).length;
      const pct = Math.round((count / total) * 100);

      document.getElementById('sideProgress').textContent = \`\${count} / \${total} choisis\`;
      document.getElementById('stickyCount').textContent = \`\${count} / \${total} coachs validés (\${pct}%)\`;
      document.getElementById('progressBar').style.width = \`\${pct}%\`;
    }

    function getCoachName(coachId) {
      const c = COACHES_DATA.find(x => x.id === coachId);
      return c ? c.name : coachId;
    }

    function toggleNote(coachId, optionId) {
      const el = document.getElementById(\`note-\${coachId}-\${optionId}\`);
      if (el) el.classList.toggle('open');
    }

    function saveCustomNote(coachId, optionId) {
      const el = document.getElementById(\`note-\${coachId}-\${optionId}\`);
      if (el) {
        userNotes[\`\${coachId}-\${optionId}\`] = el.value;
        try {
          localStorage.setItem(NOTES_KEY, JSON.stringify(userNotes));
        } catch(e) {}
      }
    }

    function copyTextToClipboard(id) {
      const [coachId, optionId] = id.split('-');
      const coach = COACHES_DATA.find(c => c.id === coachId);
      if (coach) {
        const opt = coach.options.find(o => o.id === parseInt(optionId, 10));
        if (opt) {
          navigator.clipboard.writeText(opt.text).then(() => {
            showToast('Texte copié !');
          });
        }
      }
    }

    function generateSummaryReport() {
      const lines = [];
      lines.push('================================================================');
      lines.push('CUC — SÉLECTION DES BIOGRAPHIES DES 20 COACHS (LUCAS DOLLFUS)');
      lines.push('Date : ' + new Date().toLocaleDateString('fr-FR'));
      lines.push('================================================================\\n');

      let totalSelected = 0;
      COACHES_DATA.forEach(coach => {
        const choice = userSelections[coach.id];
        if (choice) {
          totalSelected++;
          const opt = coach.options.find(o => o.id === choice);
          const note = userNotes[\`\${coach.id}-\${choice}\`];
          lines.push(\`[#\${coach.index}] \${coach.name.toUpperCase()} (\${coach.role})\`);
          lines.push(\`👉 CHOIX : Option \${choice} — \${opt ? opt.title : ''}\`);
          if (note && note.trim()) {
            lines.push(\`📝 NOTE / AJUSTEMENT : \${note.trim()}\`);
          }
          lines.push(\`TEXTE :\\n"\${opt ? opt.text : ''}"\\n\`);
        } else {
          lines.push(\`[#\${coach.index}] \${coach.name} : AUCUNE OPTION SÉLECTIONNÉE (En attente)\\n\`);
        }
      });

      lines.push('----------------------------------------------------------------');
      lines.push(\`TOTAL : \${totalSelected} / \${COACHES_DATA.length} coachs validés.\`);
      lines.push('================================================================');
      return lines.join('\\n');
    }

    function openSummaryModal() {
      const text = generateSummaryReport();
      document.getElementById('modalSummaryText').value = text;
      document.getElementById('summaryModal').classList.add('open');
    }

    function closeSummaryModal() {
      document.getElementById('summaryModal').classList.remove('open');
    }

    function copySummaryText() {
      const el = document.getElementById('modalSummaryText');
      el.select();
      navigator.clipboard.writeText(el.value).then(() => {
        showToast('Récapitulatif copié dans le presse-papier !');
      });
    }

    function downloadSummaryFile() {
      const text = generateSummaryReport();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Selection_Biographies_Coachs_CUC.txt';
      a.click();
      URL.revokeObjectURL(url);
    }

    function filterCoaches() {
      const query = document.getElementById('searchInput').value.toLowerCase().trim();
      COACHES_DATA.forEach(c => {
        const match = c.name.toLowerCase().includes(query) || c.role.toLowerCase().includes(query);
        const card = document.getElementById(\`coach-\${c.id}\`);
        const nav = document.getElementById(\`nav-\${c.id}\`);
        if (card) card.style.display = match ? 'block' : 'none';
        if (nav) nav.parentElement.style.display = match ? 'block' : 'none';
      });
    }

    function highlightNav(coachId) {
      document.querySelectorAll('.coach-nav-item').forEach(el => el.classList.remove('active'));
      const active = document.getElementById(\`nav-\${coachId}\`);
      if (active) active.classList.add('active');
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2200);
    }

    // Lancer au chargement
    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>
`;

fs.writeFileSync(outHtmlPath, html, 'utf8');
console.log(`✓ Dossier HTML exécutif généré avec succès dans : ${outHtmlPath}`);

// Également mettre à jour le markdown avec les cases à cocher [ ] et une présentation impeccable
let newMd = `# CUC — Recueil Exécutif des 5 Propositions pour les 20 Coachs

> **Document de travail destiné à :** Lucas Dollfus (Directeur Général & Fondateur CUC)  
> **Objet :** Choix des biographies officielles des 20 intervenants du Campus Univers Cascades.  
> **Consigne respectée :** *Aucune modification n'a été faite sur le site web ni en base de données.*  
> **Application web autonome :** Vous pouvez également ouvrir le fichier interactif **[\`Dossier_Selection_Biographies_Coachs_CUC.html\`](./Dossier_Selection_Biographies_Coachs_CUC.html)** directement dans votre navigateur pour cocher vos choix et exporter votre sélection en 1 clic.

---

## 📑 Sommaire Rapide

| # | Coach | Spécialité Clé | Option 1 (Parcours) | Option 2 (Plateau) | Option 3 (Pédagogie) | Option 4 (360° Recommandée) | Option 5 (Technique) |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
${coaches.map(c => `| ${c.index} | [**${c.name}**](#${c.index}-${c.id}) | ${c.role} | \`[ ]\` | \`[ ]\` | \`[ ]\` | \`[ ]\` | \`[ ]\` |`).join('\n')}

---

## 🧭 Rappel des 5 Angles Rédactionnels

* **Option 1 — « Parcours, Racines & Vocation » :** Raconte les origines (enfance, sport de départ, déclic, formation, arrivée dans le métier).
* **Option 2 — « Plateau, Réalisations & Tournages » :** Met l'accent sur les doublages de stars, récompenses (Taurus World Stunt Awards), grosses productions et cascade cinéma.
* **Option 3 — « Pédagogie, Méthode & Transmission CUC » :** Décrit concrètement les modules enseignés sur le campus du Cateau-Cambrésis (sécurité, axes de caméra, placement).
* **Option 4 — « Synthèse Complète 360° (Recommandée) » :** L'équilibre parfait combinant origines, filmographie majeure et apport pédagogique auprès des stagiaires.
* **Option 5 — « Signature Technique & Vision Métier » :** Focus sur la spécialité unique de l'intervenant (câblage 3D, feu, comédie, cascades d'impact, sabre, airbag).

---

`;

coaches.forEach(c => {
  newMd += `## <a id="${c.index}-${c.id}"></a>${c.index}. ${c.name}
**Rôle officiel :** ${c.role} — ${c.title}  
**Spécialités :** ${c.specialties.map(s => `\`${s}\``).join(', ')}  

- [ ] **Option 1 — Parcours, Racines & Vocation (Ton narratif & humain) :**  
  ${c.options[0].text}  
  *(Longueur : ${c.options[0].text.length} caractères • ~${Math.round(c.options[0].text.split(/\s+/).length)} mots)*

- [ ] **Option 2 — Plateau, Réalisations & Tournages (Ton cinéma & coordinations) :**  
  ${c.options[1].text}  
  *(Longueur : ${c.options[1].text.length} caractères • ~${Math.round(c.options[1].text.split(/\s+/).length)} mots)*

- [ ] **Option 3 — Pédagogie, Méthode & Transmission CUC (Ton campus & immersion) :**  
  ${c.options[2].text}  
  *(Longueur : ${c.options[2].text.length} caractères • ~${Math.round(c.options[2].text.split(/\s+/).length)} mots)*

- [ ] **Option 4 — Synthèse Complète 360° (⭐ Recommandée CUC) :**  
  ${c.options[3].text}  
  *(Longueur : ${c.options[3].text.length} caractères • ~${Math.round(c.options[3].text.split(/\s+/).length)} mots)*

- [ ] **Option 5 — Signature Technique & Vision Métier (Expertise pointue) :**  
  ${c.options[4].text}  
  *(Longueur : ${c.options[4].text.length} caractères • ~${Math.round(c.options[4].text.split(/\s+/).length)} mots)*

---

`;
});

fs.writeFileSync(outMdPath, newMd, 'utf8');
console.log(`✓ Fichier Markdown exécutif mis à jour dans : ${outMdPath}`);
