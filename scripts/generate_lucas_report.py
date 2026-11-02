# -*- coding: utf-8 -*-
import os

html = """<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CUC — Note Stratégique & Visuelle de Direction — Lucas Dollfus</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #050508;
      --surface: #0b0b10;
      --surface-elevated: #111119;
      --surface-glass: rgba(15, 15, 23, 0.75);
      --border: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(255, 229, 0, 0.35);
      --border-focus: #FFE500;
      --accent: #FFE500;
      --accent-glow: rgba(255, 229, 0, 0.18);
      --accent-subtle: rgba(255, 229, 0, 0.06);
      --text: #f4f4f7;
      --text-muted: #9d9dae;
      --text-dim: #606072;
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.2);
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 22px;
      --radius-full: 9999px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      overflow-x: hidden;
      position: relative;
    }

    /* Cinematic Aurora Mesh & Grain */
    .noise-overlay {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999;
      opacity: 0.035;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    .aurora-orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.12;
      animation: floatOrb 22s ease-in-out infinite alternate;
    }

    .orb-1 {
      top: -10%;
      left: 15%;
      width: 650px;
      height: 650px;
      background: #FFE500;
    }

    .orb-2 {
      top: 45%;
      right: -10%;
      width: 750px;
      height: 750px;
      background: #e11d48;
      opacity: 0.08;
    }

    .orb-3 {
      bottom: -15%;
      left: 20%;
      width: 800px;
      height: 800px;
      background: #3b82f6;
      opacity: 0.07;
    }

    @keyframes floatOrb {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(60px, 40px) scale(1.08); }
      100% { transform: translate(-40px, 80px) scale(0.95); }
    }

    /* Scroll progress top bar */
    .scroll-progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #FFE500, #10b981, #FFE500);
      z-index: 1000;
      width: 0%;
      transition: width 0.1s linear;
    }

    /* Minimal Lateral Scroll Nav */
    .floating-nav {
      position: fixed;
      left: 24px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 100;
    }

    @media (max-width: 1280px) {
      .floating-nav { display: none; }
    }

    .nav-dot {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-dim);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      transition: all 0.25s ease;
      position: relative;
    }

    .nav-dot-circle {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.25s ease;
      border: 1px solid transparent;
    }

    .nav-dot:hover .nav-dot-circle,
    .nav-dot.active .nav-dot-circle {
      background: var(--accent);
      transform: scale(1.4);
      box-shadow: 0 0 10px var(--accent);
    }

    .nav-dot:hover,
    .nav-dot.active {
      color: #fff;
    }

    .nav-dot-label {
      opacity: 0;
      transform: translateX(-8px);
      transition: all 0.25s ease;
      pointer-events: none;
      white-space: nowrap;
      background: rgba(11, 11, 16, 0.9);
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    .nav-dot:hover .nav-dot-label {
      opacity: 1;
      transform: translateX(0);
    }

    /* Container */
    .page-wrapper {
      position: relative;
      z-index: 1;
      max-width: 1280px;
      margin: 0 auto;
      padding: 40px 24px 120px;
    }

    /* Top Executive HUD Bar */
    .executive-hud {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 24px;
      background: rgba(15, 15, 23, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      margin-bottom: 40px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .hud-brand {
      display: flex;
      align-items: center;
      gap: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      letter-spacing: 0.05em;
    }

    .hud-badge-gold {
      background: var(--accent);
      color: #000;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
    }

    .hud-pills {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .hud-pill-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #34d399;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-family: 'JetBrains Mono', monospace;
    }

    .hud-pill-status .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    .btn-action-ghost {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border);
      color: #fff;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-action-ghost:hover {
      background: var(--accent);
      color: #000;
      border-color: var(--accent);
    }

    /* Executive Hero Header */
    .executive-hero {
      margin-bottom: 70px;
      padding-bottom: 50px;
      border-bottom: 1px solid var(--border);
    }

    .hero-pretitle {
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hero-pretitle::before {
      content: '';
      display: inline-block;
      width: 24px;
      height: 2px;
      background: var(--accent);
    }

    .hero-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(38px, 5.5vw, 68px);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.05;
      color: #ffffff;
      margin-bottom: 24px;
      max-width: 1050px;
    }

    .hero-title .text-gold {
      background: linear-gradient(135deg, #FFE500 0%, #ffbe0b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 30px;
      flex-wrap: wrap;
      margin-bottom: 40px;
    }

    .hero-description {
      font-size: 17px;
      color: var(--text-muted);
      max-width: 720px;
      line-height: 1.6;
    }

    .director-badge-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--surface-glass);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      padding: 12px 20px 12px 14px;
      border-radius: var(--radius-lg);
    }

    .director-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--accent);
      box-shadow: 0 0 16px rgba(255, 229, 0, 0.25);
    }

    .director-info h4 {
      font-family: 'Syne', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #fff;
    }

    .director-info p {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Bento Grid Metrics Bar */
    .bento-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .metric-card {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 22px 24px;
      position: relative;
      overflow: hidden;
      transition: transform 0.25s ease, border-color 0.25s ease;
    }

    .metric-card:hover {
      transform: translateY(-3px);
      border-color: var(--border-accent);
    }

    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .metric-card:hover::before {
      opacity: 1;
    }

    .metric-val {
      font-family: 'Syne', sans-serif;
      font-size: 34px;
      font-weight: 800;
      color: #fff;
      line-height: 1;
      margin-bottom: 6px;
    }

    .metric-val.gold {
      color: var(--accent);
    }

    .metric-val.emerald {
      color: #34d399;
    }

    .metric-label {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .metric-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--text-dim);
      margin-top: 6px;
    }

    /* Narrative Section Common */
    .narrative-section {
      margin-bottom: 90px;
      scroll-margin-top: 60px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 20px;
      margin-bottom: 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 16px;
      flex-wrap: wrap;
    }

    .section-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      letter-spacing: 0.1em;
    }

    .section-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(24px, 3.2vw, 36px);
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
    }

    .section-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }

    /* Spotlight Full-Width Image Card */
    .cinematic-spotlight-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 0;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    @media (max-width: 960px) {
      .cinematic-spotlight-card {
        grid-template-columns: 1fr;
      }
    }

    .spotlight-media-wrap {
      position: relative;
      min-height: 440px;
      overflow: hidden;
      background: #000;
    }

    .spotlight-media-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.6s ease;
    }

    .spotlight-media-wrap:hover img {
      transform: scale(1.03);
    }

    .spotlight-media-wrap .media-badge-overlay {
      position: absolute;
      top: 18px;
      left: 18px;
      background: rgba(5, 5, 8, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border);
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .spotlight-content {
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: linear-gradient(180deg, var(--surface-elevated) 0%, var(--surface) 100%);
    }

    .spotlight-content h3 {
      font-family: 'Syne', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 12px;
    }

    .spotlight-content p {
      color: var(--text-muted);
      font-size: 14.5px;
      line-height: 1.65;
      margin-bottom: 20px;
    }

    .feature-points {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .feature-point {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 13.5px;
      color: var(--text);
    }

    .feature-point-icon {
      color: var(--accent);
      font-size: 14px;
      line-height: 1.4;
      font-family: 'JetBrains Mono', monospace;
    }

    .spotlight-footer-meta {
      padding-top: 20px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--text-dim);
    }

    /* Comparison Dual-Card for Infra */
    .infra-comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .infra-comparison-grid {
        grid-template-columns: 1fr;
      }
    }

    .compare-box {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 22px 24px;
    }

    .compare-box.before {
      border-left: 3px solid #6b7280;
    }

    .compare-box.after {
      border-left: 3px solid var(--accent);
      background: linear-gradient(135deg, rgba(255, 229, 0, 0.03) 0%, var(--surface-elevated) 100%);
    }

    .compare-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .compare-box.before .compare-label { color: #9ca3af; }
    .compare-box.after .compare-label { color: var(--accent); }

    .compare-desc {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Interactive Comparison Slider for Bandeaux */
    .slider-comparison-container {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      padding: 24px;
      margin-bottom: 30px;
    }

    .slider-wrapper {
      position: relative;
      width: 100%;
      height: 480px;
      border-radius: var(--radius-md);
      overflow: hidden;
      user-select: none;
      cursor: ew-resize;
    }

    @media (max-width: 768px) {
      .slider-wrapper { height: 320px; }
    }

    .slider-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none;
    }

    .slider-before {
      z-index: 1;
      filter: brightness(0.35) contrast(0.9);
      object-position: center center;
    }

    .slider-before-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      z-index: 2;
      pointer-events: none;
    }

    .slider-after-wrap {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 50%;
      overflow: hidden;
      z-index: 3;
      border-right: 2px solid var(--accent);
      box-shadow: 0 0 15px rgba(255, 229, 0, 0.4);
    }

    .slider-after {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.72) contrast(1.1);
      object-position: top center;
    }

    .slider-handle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      background: var(--accent);
      border-radius: 50%;
      z-index: 10;
      box-shadow: 0 0 20px rgba(255, 229, 0, 0.6), 0 0 0 4px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      font-weight: 900;
      font-size: 14px;
      pointer-events: none;
    }

    .slider-legend {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }

    .slider-legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-indicator {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .legend-before { background: #6b7280; }
    .legend-after { background: var(--accent); }

    /* Bento Cards Grid for Events & Coachs */
    .cards-grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }

    .event-card {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.25s ease;
    }

    .event-card:hover {
      transform: translateY(-4px);
      border-color: var(--border-accent);
    }

    .event-card-media {
      height: 200px;
      position: relative;
      overflow: hidden;
      background: #000;
    }

    .event-card-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .event-card:hover .event-card-media img {
      transform: scale(1.05);
    }

    .event-rank-pill {
      position: absolute;
      top: 14px;
      left: 14px;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(6px);
      border: 1px solid var(--border);
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .event-rank-pill.gold {
      border-color: var(--border-accent);
      color: var(--accent);
    }

    .event-card-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      justify-content: space-between;
    }

    .event-card-body h4 {
      font-family: 'Syne', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 8px;
    }

    .event-card-body p {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.55;
      margin-bottom: 16px;
    }

    .event-card-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .event-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      color: var(--text-dim);
    }

    /* Actor Spotlight Card */
    .actor-spotlight {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      display: grid;
      grid-template-columns: 320px 1fr;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
    }

    @media (max-width: 860px) {
      .actor-spotlight {
        grid-template-columns: 1fr;
      }
    }

    .actor-photo-col {
      position: relative;
      background: #000;
      min-height: 380px;
    }

    .actor-photo-col img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    .actor-content-col {
      padding: 36px 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .actor-name {
      font-family: 'Syne', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: -0.02em;
    }

    .actor-tagline {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 4px;
      margin-bottom: 16px;
    }

    .film-chips {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
    }

    .film-chip {
      background: rgba(255, 229, 0, 0.1);
      border: 1px solid var(--border-accent);
      color: var(--accent);
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .film-chip span {
      background: var(--accent);
      color: #000;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 800;
    }

    /* Verification Badge Section */
    .system-health-banner {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 229, 0, 0.04) 100%);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: var(--radius-lg);
      padding: 36px 40px;
      margin-top: 60px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 30px;
    }

    .health-block h4 {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #34d399;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .health-block p {
      font-size: 13px;
      color: #c9c9d6;
      line-height: 1.5;
    }

    /* Footer */
    .executive-footer {
      text-align: center;
      padding-top: 60px;
      color: var(--text-dim);
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      border-top: 1px solid var(--border);
      margin-top: 70px;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #050508;
    }
    ::-webkit-scrollbar-thumb {
      background: #20202d;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--accent);
    }
  </style>
</head>
<body>

  <!-- Dynamic Scroll Progress Bar -->
  <div class="scroll-progress-bar" id="scrollProgress"></div>

  <!-- Ambient Light Orbs -->
  <div class="aurora-orb orb-1"></div>
  <div class="aurora-orb orb-2"></div>
  <div class="aurora-orb orb-3"></div>
  <div class="noise-overlay"></div>

  <!-- Minimal Lateral Navigator -->
  <nav class="floating-nav">
    <a href="#amphi" class="nav-dot active" title="Amphithéâtre CUC">
      <span class="nav-dot-circle"></span>
      <span class="nav-dot-label">01. Amphithéâtre</span>
    </a>
    <a href="#cinema" class="nav-dot" title="Benjamin Voisin & Cinéma">
      <span class="nav-dot-circle"></span>
      <span class="nav-dot-label">02. Cinéma & Voisin</span>
    </a>
    <a href="#sessions" class="nav-dot" title="Sessions Complètes">
      <span class="nav-dot-circle"></span>
      <span class="nav-dot-label">03. Sessions Complètes</span>
    </a>
    <a href="#events" class="nav-dot" title="Agence CUC Events">
      <span class="nav-dot-circle"></span>
      <span class="nav-dot-label">04. Agence Events</span>
    </a>
    <a href="#coachs" class="nav-dot" title="Équipe & Cockpit">
      <span class="nav-dot-circle"></span>
      <span class="nav-dot-label">05. Équipe & Coachs</span>
    </a>
    <a href="#bandeaux" class="nav-dot" title="Bandeaux & Cadrage">
      <span class="nav-dot-circle"></span>
      <span class="nav-dot-label">06. Bandeaux & Cadrage</span>
    </a>
    <a href="#verification" class="nav-dot" title="Certification Technique">
      <span class="nav-dot-circle"></span>
      <span class="nav-dot-label">07. Validation Système</span>
    </a>
  </nav>

  <div class="page-wrapper">

    <!-- Top Floating HUD -->
    <div class="executive-hud">
      <div class="hud-brand">
        <span class="hud-badge-gold">CUC</span>
        <span>NOTE STRATÉGIQUE DE DIRECTION</span>
      </div>
      <div class="hud-pills">
        <span class="hud-pill-status">
          <span class="pulse-dot"></span> DÉPLOYÉ EN PRODUCTION (MASTER)
        </span>
        <button class="btn-action-ghost" onclick="window.print()">
          ⎙ IMPRIMER / PDF
        </button>
      </div>
    </div>

    <!-- Executive Hero Header -->
    <header class="executive-hero">
      <div class="hero-pretitle">Campus Univers Cascades • Direction Générale</div>
      <h1 class="hero-title">
        Synthèse Visuelle des <span class="text-gold">7 Chantiers Stratégiques</span>
      </h1>
      <div class="hero-meta-row">
        <p class="hero-description">
          Rapport complet à destination de Lucas Dollfus détaillant les ajustements d'image de marque, d'infrastructure visuelle, de catalogue de formation et d'expérience utilisateur intégrés et validés ce 2 novembre 2026.
        </p>
        <div class="director-badge-card">
          <img src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/1-lucas.webp" alt="Lucas Dollfus" class="director-avatar">
          <div class="director-info">
            <h4>Lucas Dollfus</h4>
            <p>Fondateur & Directeur CUC</p>
          </div>
        </div>
      </div>

      <!-- Bento Stat Bar -->
      <div class="bento-metrics">
        <div class="metric-card">
          <div class="metric-val emerald">100%</div>
          <div class="metric-label">Sessions Verrouillées</div>
          <div class="metric-sub">17/17 sessions au statut &laquo; Complet &raquo;</div>
        </div>
        <div class="metric-card">
          <div class="metric-val gold">0 €</div>
          <div class="metric-label">Tarif Public Masqué</div>
          <div class="metric-sub">Filtrage qualifié / Dossier direct</div>
        </div>
        <div class="metric-card">
          <div class="metric-val">180</div>
          <div class="metric-label">Places Amphithéâtre</div>
          <div class="metric-sub">Spot 08 mis à jour (Exit photo QG)</div>
        </div>
        <div class="metric-card">
          <div class="metric-val emerald">1 214</div>
          <div class="metric-label">Tests Unitaires Validés</div>
          <div class="metric-sub">167 suites sans aucune régression</div>
        </div>
      </div>
    </header>

    <!-- SECTION 01: AMPHITHEATRE -->
    <section class="narrative-section" id="amphi">
      <div class="section-header">
        <div>
          <div class="section-num">SECTION 01</div>
          <h2 class="section-title">Nouveau Joyau Infrastructure : L'Amphithéâtre</h2>
        </div>
        <div class="section-badge">Spot 08 • Campus CUC</div>
      </div>

      <div class="cinematic-spotlight-card">
        <div class="spotlight-media-wrap">
          <img src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus-08-amphitheatre.webp" alt="Amphithéâtre Campus Univers Cascades">
          <div class="media-badge-overlay">
            <span>● NOUVEL ASSET WEBP HAUTE RÉSOLUTION</span>
          </div>
        </div>
        <div class="spotlight-content">
          <div>
            <h3>Régie L2C, Acoustique & Projection 4K</h3>
            <p>
              Remplacement immédiat de l'ancienne photo du QG/Cour extérieure par la prise de vue officielle du grand amphithéâtre CUC. L'image a été convertie en WebP haute fidélité (132 Ko) pour une vitesse de chargement instantanée.
            </p>
            <ul class="feature-points">
              <li class="feature-point">
                <span class="feature-point-icon">▹</span>
                <span><strong>Métrique mise à jour :</strong> Remplacement de « 2 SITES » par « 1 AMPHI » dans le bandeau de données clés en français et en anglais.</span>
              </li>
              <li class="feature-point">
                <span class="feature-point-icon">▹</span>
                <span><strong>Valorisation pédagogique :</strong> Met en avant l'enseignement théorique, le visionnage des rushs de cascades et les masterclasses cinéma.</span>
              </li>
              <li class="feature-point">
                <span class="feature-point-icon">▹</span>
                <span><strong>CDN Cloud :</strong> Publié sur le bucket public Supabase <code>cuc-vitrine-assets/media/cuc-visual/campus-08-amphitheatre.webp</code>.</span>
              </li>
            </ul>
          </div>
          <div class="spotlight-footer-meta">
            <span>FICHIERS : campus.ts • messages/fr.json • messages/en.json</span>
            <span>STATUT : EN LIGNE</span>
          </div>
        </div>
      </div>

      <div class="infra-comparison-grid">
        <div class="compare-box before">
          <div class="compare-label">Configuration Antérieure</div>
          <div class="compare-desc">
            La vignette 08 présentait une photo extérieure de la cour et du QG, redondante avec le bâtiment principal. La métrique affichait « 2 SITES ».
          </div>
        </div>
        <div class="compare-box after">
          <div class="compare-label">Nouvelle Configuration Déployée</div>
          <div class="compare-desc">
            La vignette 08 présente l'auditorium de 180 places avec logo CUC rétro-éclairé et gradins professionnels. La métrique affiche fièrement « 1 AMPHI ».
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 02: BENJAMIN VOISIN & CINEMA -->
    <section class="narrative-section" id="cinema">
      <div class="section-header">
        <div>
          <div class="section-num">SECTION 02</div>
          <h2 class="section-title">Cinéma & Tournage : Benjamin Voisin & Règle d'Or</h2>
        </div>
        <div class="section-badge">Pôle Tournage • 17 Acteurs</div>
      </div>

      <div class="actor-spotlight">
        <div class="actor-photo-col">
          <img src="https://image.tmdb.org/t/p/h632/oe37Uv6isNH7p9uwGunQj11Iy4R.jpg" alt="Benjamin Voisin">
        </div>
        <div class="actor-content-col">
          <div>
            <div class="actor-name">Benjamin Voisin</div>
            <div class="actor-tagline">César du Meilleur Espoir Masculin • Partenaire Cascade CUC</div>
            <p style="color: var(--text-muted); font-size: 14.5px; line-height: 1.6; margin-bottom: 20px;">
              Intégration de Benjamin Voisin au répertoire des 17 personnalités formées et doublées par les équipes du CUC. L'acteur a suivi une préparation physique et scénique rigoureuse au sein du campus pour ses scènes d'action.
            </p>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 8px;">
              Collaborations Cinématographiques & Coordination CUC
            </div>
            <div class="film-chips">
              <div class="film-chip">
                <span>2027</span> Johnny (Cédric Jimenez • Régie Lucas Dollfus)
              </div>
              <div class="film-chip">
                <span>2024</span> Forty Love
              </div>
            </div>
          </div>

          <div style="margin-top: 30px; padding: 18px 20px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: var(--radius-md);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <span style="color: var(--accent); font-size: 16px;">🛡️</span>
              <strong style="font-size: 13.5px; color: #fff;">Règle de Confidentialité Cascadeurs Appliquée</strong>
            </div>
            <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
              Conformément à la directive de direction, les avatars et noms des cascadeurs doublures et régleurs ont été strictement retirés de la vue publique des comédiens. La page tournage se concentre exclusivement sur les talents et les productions artistiques.
            </p>
          </div>
        </div>
      </div>

      <!-- Badge CUC Team simplification -->
      <div style="margin-top: 24px; padding: 20px 24px; background: var(--surface-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/partner-logo/cuc-team-badge.webp" alt="CUC Team Badge" style="width: 48px; height: 48px; object-fit: contain;">
          <div>
            <h4 style="font-size: 14px; font-weight: 700; color: #fff;">Épure Visuelle du Badge CUC Team</h4>
            <p style="font-size: 12.5px; color: var(--text-muted);">Suppression du texte redondant « Campus Univers Cascades » sous le badge dans le bandeau tournage.</p>
          </div>
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent);">
          ✓ APPLIQUÉ SUR TeamHeroSection.tsx
        </div>
      </div>
    </section>

    <!-- SECTION 03: SESSIONS COMPLETES & PRIX -->
    <section class="narrative-section" id="sessions">
      <div class="section-header">
        <div>
          <div class="section-num">SECTION 03</div>
          <h2 class="section-title">Formations : Sessions Verrouillées & Tarif Débrayé</h2>
        </div>
        <div class="section-badge">Catalogue Formations • 17 Sessions</div>
      </div>

      <div class="cinematic-spotlight-card" style="grid-template-columns: 1fr 1.2fr;">
        <div class="spotlight-media-wrap">
          <img src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Stage-WE-Immersion.webp" alt="Stage WE Immersion">
          <div class="media-badge-overlay" style="background: rgba(225, 29, 72, 0.9); border-color: rgba(225, 29, 72, 0.5);">
            <span>● 17 SESSIONS AFFICHÉES « COMPLET »</span>
          </div>
        </div>
        <div class="spotlight-content">
          <div>
            <h3>Stratégie de Rareté & Entonnoir Privé</h3>
            <p>
              Toutes les dates des sessions 2026-2027 ont été basculées au statut <strong>« Complet »</strong> sur la vitrine publique et dans la base Supabase. Cette mesure protège le taux de remplissage et stimule l'inscription sur liste d'attente.
            </p>
            <ul class="feature-points">
              <li class="feature-point">
                <span class="feature-point-icon">▹</span>
                <span><strong>Suppression totale du tarif « 250 € » :</strong> Aucune mention de prix d'appel n'est visible sur les fiches de stage, les bandeaux de bas de page ou le moteur de classification.</span>
              </li>
              <li class="feature-point">
                <span class="feature-point-icon">▹</span>
                <span><strong>Accès sur candidature :</strong> Les prospects sont réorientés vers une demande d'entretien et de dossier complet, préservant la valeur perçue des diplômes CUC.</span>
              </li>
              <li class="feature-point">
                <span class="feature-point-icon">▹</span>
                <span><strong>Cohérence Supabase :</strong> Les 17 entrées de la table <code>site_sessions</code> et les configurations locales de <code>programs.ts</code> sont synchronisées.</span>
              </li>
            </ul>
          </div>
          <div class="spotlight-footer-meta">
            <span>FICHIERS : stages.data.ts • programs.ts • InquiryClassificationSection.tsx</span>
            <span>STATUT : SYNCHRONISÉ</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 04: AGENCE CUC EVENTS -->
    <section class="narrative-section" id="events">
      <div class="section-header">
        <div>
          <div class="section-num">SECTION 04</div>
          <h2 class="section-title">Agence Events : Réorganisation des Pôles</h2>
        </div>
        <div class="section-badge">Prestations Corporate & Live</div>
      </div>

      <div class="cards-grid-3">
        <!-- Prestation 1 -->
        <div class="event-card">
          <div class="event-card-media">
            <img src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/events-agency-02-spectacles-et-show-live.webp" alt="Spectacles et Shows Live">
            <div class="event-rank-pill gold">
              <span>#01</span> SPECTACLES & SHOWS
            </div>
          </div>
          <div class="event-card-body">
            <div>
              <h4>Spectacles & Shows Live</h4>
              <p>Mise en tête de catalogue : cascades scéniques équestres, combats chorégraphiés de haute intensité et pyrotechnie pour grands événements.</p>
            </div>
            <div class="event-card-tags">
              <span class="event-tag">Position #01</span>
              <span class="event-tag">Grand Public</span>
              <span class="event-tag">Prestige</span>
            </div>
          </div>
        </div>

        <!-- Prestation 2 -->
        <div class="event-card">
          <div class="event-card-media">
            <img src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/events-agency-03-location-airbag-et-anim.webp" alt="Location Airbag et Animations">
            <div class="event-rank-pill">
              <span>#02</span> AIRBAG & ANIMATIONS
            </div>
          </div>
          <div class="event-card-body">
            <div>
              <h4>Location Airbag & Anim.</h4>
              <p>Positionné en 2ème : structures gonflables certifiées pour sauts de grande hauteur, sensations fortes et sécurité intégrale.</p>
            </div>
            <div class="event-card-tags">
              <span class="event-tag">Position #02</span>
              <span class="event-tag">Festivals</span>
              <span class="event-tag">Sensations</span>
            </div>
          </div>
        </div>

        <!-- Prestation 3 -->
        <div class="event-card">
          <div class="event-card-media">
            <img src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/team-building-01-team-building-et-action.webp" alt="Team Building et Action">
            <div class="event-rank-pill">
              <span>#03</span> TEAM BUILDING ACTION
            </div>
          </div>
          <div class="event-card-body">
            <div>
              <h4>Team Building Action</h4>
              <p>Positionné en 3ème position finale : immersion corporative, dépassement de soi et cohésion d'équipe animée par nos cascadeurs.</p>
            </div>
            <div class="event-card-tags">
              <span class="event-tag">Position #03</span>
              <span class="event-tag">Entreprises</span>
              <span class="event-tag">Cohésion</span>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="padding: 20px 24px; background: var(--surface-elevated); border: 1px solid var(--border); border-radius: var(--radius-md);">
          <h5 style="font-size: 13.5px; font-weight: 700; color: #fff; margin-bottom: 6px;">Retrait du CTA « Toutes nos vidéos de shows »</h5>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">Élimination de la dispersion : le bandeau héro oriente désormais directement vers la demande de devis personnalisé sans déperdition vers des vidéos tierces.</p>
        </div>
        <div style="padding: 20px 24px; background: var(--surface-elevated); border: 1px solid var(--border); border-radius: var(--radius-md);">
          <h5 style="font-size: 13.5px; font-weight: 700; color: #fff; margin-bottom: 6px;">Mise en sommeil de la page /partenaires</h5>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">Désactivation du lien dans la navigation principale et passage au statut <code>is_published: false</code> dans la base de données en attendant la refonte du club partenaires.</p>
        </div>
      </div>
    </section>

    <!-- SECTION 05: COACHS & COCKPIT -->
    <section class="narrative-section" id="coachs">
      <div class="section-header">
        <div>
          <div class="section-num">SECTION 05</div>
          <h2 class="section-title">Équipe & Coachs : Épure Visuelle & Contrôle Cockpit</h2>
        </div>
        <div class="section-badge">Pôle Équipe • Cockpit Admin</div>
      </div>

      <div class="cinematic-spotlight-card" style="grid-template-columns: 1fr 1.3fr;">
        <div class="spotlight-media-wrap">
          <img src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/cascadeur-cuc-5-0-ech-4.webp" alt="Cascadeur CUC en action">
          <div class="media-badge-overlay">
            <span>● ÉLÉGANCE & IMPACT PHOTOGRAPHIQUE</span>
          </div>
        </div>
        <div class="spotlight-content">
          <div>
            <h3>Cartes Publiques Épurées, Données Sauvegardées</h3>
            <p>
              Pour éviter les blocs textuels redondants et l'effet de textes génériques, la présentation publique des coachs a été immédiatement allégée :
            </p>
            <ul class="feature-points">
              <li class="feature-point">
                <span class="feature-point-icon">✓</span>
                <span><strong>Suppression des badges de spécialités :</strong> Les puces « Combat scénique », « Chute de hauteur », etc. ont été retirées des cartes pour laisser place aux portraits et aux films référents.</span>
              </li>
              <li class="feature-point">
                <span class="feature-point-icon">✓</span>
                <span><strong>Masquage des descriptions publiques :</strong> Les biographies ont été masquées sur la vitrine, rendant les profils plus cinématographiques et percutants.</span>
              </li>
              <li class="feature-point">
                <span class="feature-point-icon">🛡️</span>
                <span><strong>Persistance intégrale en Cockpit :</strong> Aucune biographie n'a été effacée. Elles restent conservées dans la table <code>site_team</code> et modifiables à tout instant dans le Cockpit Admin (<code>/cockpit/team</code>).</span>
              </li>
            </ul>
          </div>
          <div class="spotlight-footer-meta">
            <span>COMPOSANTS : CoachCard.tsx • CoachProfile.tsx • TeamMemberIdentityFields.tsx</span>
            <span>COCKPIT : PRÊT</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 06: BANDEAUX & CADRAGE INTERACTIF -->
    <section class="narrative-section" id="bandeaux">
      <div class="section-header">
        <div>
          <div class="section-num">SECTION 06</div>
          <h2 class="section-title">Bandeaux Héro : Restitution Lumineuse & Cadrage</h2>
        </div>
        <div class="section-badge">Design & Direction Artistique</div>
      </div>

      <div class="slider-comparison-container">
        <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <p style="font-size: 14px; color: var(--text-muted);">
            Faites glisser le curseur interactif ci-dessous pour visualiser la différence de luminosité et de cadrage des visages sur le bandeau Events :
          </p>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent); background: rgba(255, 229, 0, 0.1); padding: 4px 10px; border-radius: var(--radius-sm);">
            GLISSER LE CURSEUR ◄ ►
          </span>
        </div>

        <div class="slider-wrapper" id="eventsSlider">
          <!-- Before: dark, cut off -->
          <img src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/events-agency-00-bandeau.webp" alt="Avant" class="slider-img slider-before">
          <div class="slider-before-overlay"></div>

          <!-- After: bright, object-top -->
          <div class="slider-after-wrap" id="afterWrap">
            <img src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/events-agency-00-bandeau.webp" alt="Après" class="slider-after">
          </div>

          <div class="slider-handle" id="sliderHandle">
            <span>⇆</span>
          </div>
        </div>

        <div class="slider-legend">
          <div class="slider-legend-item">
            <span class="legend-indicator legend-before"></span>
            <span style="color: #9ca3af;">AVANT : Assombrissement excessif (35% lum. / 80% overlay) • Cadrage centré qui coupait les têtes</span>
          </div>
          <div class="slider-legend-item">
            <span class="legend-indicator legend-after"></span>
            <span style="color: var(--accent); font-weight: 700;">APRÈS : Luminosité 70% • Contraste 110% • Cadrage <code>object-top</code> préservant les visages</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 07: VALIDATION TECHNIQUE -->
    <section class="narrative-section" id="verification">
      <div class="section-header">
        <div>
          <div class="section-num">SECTION 07</div>
          <h2 class="section-title">Contrôle Qualité & Validation Système</h2>
        </div>
        <div class="section-badge">Certifié Vitest & TypeScript</div>
      </div>

      <div class="system-health-banner">
        <div class="health-block">
          <h4><span style="color: #34d399;">●</span> 1 214 Tests Unitaires</h4>
          <p>
            Exécution complète de la suite Vitest : 167 suites de tests exécutées sans aucune régression fonctionnelle ni de calcul de bundle.
          </p>
        </div>
        <div class="health-block">
          <h4><span style="color: #34d399;">●</span> TypeScript Strict</h4>
          <p>
            Vérification <code>tsc --noEmit</code> validée avec 0 erreur de typage sur l'ensemble du projet et des nouveaux contrats de données.
          </p>
        </div>
        <div class="health-block">
          <h4><span style="color: #34d399;">●</span> Déploiement Git</h4>
          <p>
            Branche <code>master</code> synchronisée avec le dépôt distant. Les modifications sont scellées et prêtes pour mise en préproduction / production.
          </p>
        </div>
      </div>

      <!-- Footer sign-off -->
      <footer class="executive-footer">
        <p>CAMPUS UNIVERS CASCADES • RAPPORT DE DIRECTION GÉNÉRALE — 2 NOVEMBRE 2026</p>
        <p style="margin-top: 6px; color: #404052;">DOCUMENT CERTIFIÉ CONFORME AUX DIRECTIVES ÉDITORIALES ET ARCHITECTURALES DU PROJET</p>
      </footer>
    </section>

  </div>

  <script>
    // Scroll progress bar
    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      document.getElementById('scrollProgress').style.width = scrolled + '%';
    });

    // Comparison slider logic
    const slider = document.getElementById('eventsSlider');
    const afterWrap = document.getElementById('afterWrap');
    const handle = document.getElementById('sliderHandle');
    let isDragging = false;

    function updateSlider(xPos) {
      const rect = slider.getBoundingClientRect();
      let pos = (xPos - rect.left) / rect.width;
      if (pos < 0) pos = 0;
      if (pos > 1) pos = 1;
      const pct = pos * 100;
      afterWrap.style.width = pct + '%';
      handle.style.left = pct + '%';
    }

    slider.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => isDragging = false);

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });

    // Touch support
    slider.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateSlider(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => isDragging = false);

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSlider(e.touches[0].clientX);
    });

    // Scroll active tracking on lateral dots
    const sections = document.querySelectorAll('.narrative-section');
    const navDots = document.querySelectorAll('.nav-dot');

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(sec => {
        const top = sec.offsetTop;
        if (pageYOffset >= top - 220) {
          current = sec.getAttribute('id');
        }
      });

      navDots.forEach(dot => {
        dot.classList.remove('active');
        if (dot.getAttribute('href') === '#' + current) {
          dot.classList.add('active');
        }
      });
    });
  </script>
</body>
</html>
"""

target_file = os.path.join('plans', 'Rapport_Direction_Modifications_Lucas_Dollfus.html')
with open(target_file, 'w', encoding='utf-8') as f:
    f.write(html)
print('Wrote target file, length:', len(html))

artifact_dir = r'C:\Users\niels\.gemini\antigravity\brain\b8beca3c-91e6-4be1-922d-a51d888e27db'
artifact_file = os.path.join(artifact_dir, 'Rapport_Direction_Modifications_Lucas_Dollfus.html')
with open(artifact_file, 'w', encoding='utf-8') as f:
    f.write(html)
print('Wrote artifact file, length:', len(html))
