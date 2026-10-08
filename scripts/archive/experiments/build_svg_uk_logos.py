import json
import os
import sys
sys.path.insert(0, os.path.abspath("."))

with open("scripts/assets/cuc_geometry.json", "r", encoding="utf-8") as f:
    cuc = json.load(f)

from scripts.generate_clean_typography import get_clean_cuc_text_vectors
text_paths, star_path = get_clean_cuc_text_vectors()

cl_black = cuc["cl_black"]
cl_white = cuc["cl_white"]
cr_black = cuc["cr_black"]
cr_white = cuc["cr_white"]

u_out   = cuc["u_out"]
u_white = cuc["u_white"]
u_core  = cuc["u_core"]

# Geometry constants
CX = 512.0
CY = 512.0
R_OUTER = 475.0
R_INNER = 356.0
R_OUT_LINE = 493.0
R_IN_LINE = 338.5

# Horizontal cuts for top and bottom arcs
Y_CUT_TOP = 292.0
Y_CUT_BOTTOM = 750.0

# Official UK & England Flag colors
UK_BLUE   = "#012169"  # Royal Navy Pantone 280 C
UK_RED    = "#C8102E"  # Royal Red Pantone 186 C
WHITE     = "#FFFFFF"
DARK_LINE = "#111111"
SPORT_NAVY = "#061024"

def make_union_jack_full():
    return f"""
    <!-- Full Authentic Union Jack -->
    <g id="union-jack-full">
      <!-- Blue Field -->
      <rect x="0" y="0" width="1024" height="1024" fill="{UK_BLUE}" />
      
      <!-- St Andrew Saltire (White Diagonals) -->
      <line x1="0" y1="0" x2="1024" y2="1024" stroke="{WHITE}" stroke-width="110" />
      <line x1="1024" y1="0" x2="0" y2="1024" stroke="{WHITE}" stroke-width="110" />
      
      <!-- St Patrick Saltire (Red Pin-stripes) -->
      <!-- Quadrant Top-Left -->
      <polygon points="0,0 20,0 512,492 492,512 0,20" fill="{UK_RED}" />
      <!-- Quadrant Bottom-Right -->
      <polygon points="512,532 532,512 1024,1004 1024,1024 1004,1024" fill="{UK_RED}" />
      <!-- Quadrant Top-Right -->
      <polygon points="1024,0 1024,20 532,512 512,492 1004,0" fill="{UK_RED}" />
      <!-- Quadrant Bottom-Left -->
      <polygon points="0,1024 0,1004 492,512 512,532 20,1024" fill="{UK_RED}" />
      
      <!-- St George Cross (White Underlay) -->
      <rect x="{CX - 85}" y="0" width="170" height="1024" fill="{WHITE}" />
      <rect x="0" y="{CY - 85}" width="1024" height="170" fill="{WHITE}" />
      
      <!-- St George Cross (Red Cross) -->
      <rect x="{CX - 50}" y="0" width="100" height="1024" fill="{UK_RED}" />
      <rect x="0" y="{CY - 50}" width="1024" height="100" fill="{UK_RED}" />
    </g>
    """

def make_ring_clips():
    return f"""
    <clipPath id="ring-arcs-clip">
      <rect x="0" y="0" width="1024" height="{Y_CUT_TOP}" />
      <rect x="0" y="{Y_CUT_BOTTOM}" width="1024" height="{1024 - Y_CUT_BOTTOM}" />
    </clipPath>
    <mask id="ring-donut-mask">
      <rect x="0" y="0" width="1024" height="1024" fill="black" />
      <circle cx="{CX}" cy="{CY}" r="{R_OUTER}" fill="white" />
      <circle cx="{CX}" cy="{CY}" r="{R_INNER}" fill="black" />
    </mask>
    """

def render_texts(text_fill=WHITE, text_stroke=DARK_LINE, stroke_w=2.5, star_fill=None):
    if star_fill is None:
        star_fill = text_fill
    lines = []
    for d in text_paths:
        lines.append(f'<path d="{d}" fill="{text_fill}" stroke="{text_stroke}" stroke-width="{stroke_w}" stroke-linejoin="miter" paint-order="stroke fill" fill-rule="evenodd" />')
    if star_path:
        lines.append(f'<path d="{star_path}" fill="{star_fill}" stroke="{text_stroke}" stroke-width="{stroke_w}" stroke-linejoin="miter" paint-order="stroke fill" fill-rule="evenodd" />')
    return "\n      ".join(lines)

def render_cuc_letters(u_core_content=None, u_fill=UK_RED, c_fill=DARK_LINE, u_stroke=DARK_LINE):
    c_left = f"""
      <!-- Left C -->
      <path d="{cl_black}" fill="{c_fill}" fill-rule="evenodd" />
      <path d="{cl_white}" fill="{WHITE}" />
    """
    c_right = f"""
      <!-- Right C -->
      <path d="{cr_black}" fill="{c_fill}" fill-rule="evenodd" />
      <path d="{cr_white}" fill="{WHITE}" />
    """
    if u_core_content:
        u_mid = f"""
      <!-- Center U with Union Jack -->
      <path d="{u_out}" fill="{u_stroke}" />
      <path d="{u_white}" fill="{WHITE}" />
      <g clip-path="url(#u-core-clip)">
        {u_core_content}
      </g>
      <path d="{u_core}" fill="none" stroke="{DARK_LINE}" stroke-width="2" />
        """
    else:
        u_mid = f"""
      <!-- Center U -->
      <path d="{u_out}" fill="{u_stroke}" />
      <path d="{u_white}" fill="{WHITE}" />
      <path d="{u_core}" fill="{u_fill}" />
        """
    return f"{c_left}\n{u_mid}\n{c_right}"

# =========================================================================
# VARIATION 1: cuc-logo-uk-ring.svg (Full Union Jack Ring Motif)
# =========================================================================
svg_v1 = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    {make_ring_clips()}
    {make_union_jack_full()}
    <filter id="text-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.9" />
    </filter>
  </defs>

  <!-- === 1. RING WITH UNION JACK PATTERN === -->
  <g clip-path="url(#ring-arcs-clip)">
    <!-- Base Union Jack Pattern in Ring -->
    <g mask="url(#ring-donut-mask)">
      <use href="#union-jack-full" />
    </g>

    <!-- Outermost & Innermost Borders -->
    <circle cx="{CX}" cy="{CY}" r="{R_OUT_LINE}" fill="none" stroke="{DARK_LINE}" stroke-width="6" />
    <circle cx="{CX}" cy="{CY}" r="{R_OUT_LINE - 6}" fill="none" stroke="{WHITE}" stroke-width="2" />
    <circle cx="{CX}" cy="{CY}" r="{R_OUTER}" fill="none" stroke="{WHITE}" stroke-width="3" />
    
    <circle cx="{CX}" cy="{CY}" r="{R_INNER}" fill="none" stroke="{WHITE}" stroke-width="3" />
    <circle cx="{CX}" cy="{CY}" r="{R_IN_LINE + 5}" fill="none" stroke="{WHITE}" stroke-width="2" />
    <circle cx="{CX}" cy="{CY}" r="{R_IN_LINE}" fill="none" stroke="{DARK_LINE}" stroke-width="5" />
  </g>

  <!-- === 2. TEXTS & STAR === -->
  <g filter="url(#text-glow)">
    {render_texts(text_fill=WHITE, text_stroke=DARK_LINE, stroke_w=2.5, star_fill=WHITE)}
  </g>

  <!-- === 3. C U C CENTRAL LETTERS === -->
  {render_cuc_letters(u_fill=UK_RED, c_fill=DARK_LINE, u_stroke=DARK_LINE)}
</svg>
"""

# =========================================================================
# VARIATION 2: cuc-logo-uk-sport.svg (Varsity Sportswear UK Edition)
# =========================================================================
svg_v2 = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    {make_ring_clips()}
  </defs>

  <!-- === 1. SOLID ROYAL NAVY RING WITH SPORT RACING STRIPES === -->
  <g clip-path="url(#ring-arcs-clip)">
    <!-- Main Ring Body: Deep Navy -->
    <path d="M {CX},{CY - R_OUTER} 
             A {R_OUTER} {R_OUTER} 0 1 0 {CX},{CY + R_OUTER} 
             A {R_OUTER} {R_OUTER} 0 1 0 {CX},{CY - R_OUTER} 
             M {CX},{CY - R_INNER} 
             A {R_INNER} {R_INNER} 0 1 1 {CX},{CY + R_INNER} 
             A {R_INNER} {R_INNER} 0 1 1 {CX},{CY - R_INNER} Z" 
          fill="{UK_BLUE}" fill-rule="evenodd" />

    <!-- Outermost Accent Lines -->
    <circle cx="{CX}" cy="{CY}" r="{R_OUT_LINE}" fill="none" stroke="{DARK_LINE}" stroke-width="6" />
    <circle cx="{CX}" cy="{CY}" r="{R_OUT_LINE - 6}" fill="none" stroke="{UK_RED}" stroke-width="4" />
    <circle cx="{CX}" cy="{CY}" r="{R_OUT_LINE - 11}" fill="none" stroke="{WHITE}" stroke-width="2" />
    
    <!-- Ring Boundaries -->
    <circle cx="{CX}" cy="{CY}" r="{R_OUTER}" fill="none" stroke="{WHITE}" stroke-width="3" />
    <circle cx="{CX}" cy="{CY}" r="{R_INNER}" fill="none" stroke="{WHITE}" stroke-width="3" />
    
    <!-- Innermost Accent Lines -->
    <circle cx="{CX}" cy="{CY}" r="{R_IN_LINE + 11}" fill="none" stroke="{WHITE}" stroke-width="2" />
    <circle cx="{CX}" cy="{CY}" r="{R_IN_LINE + 6}" fill="none" stroke="{UK_RED}" stroke-width="4" />
    <circle cx="{CX}" cy="{CY}" r="{R_IN_LINE}" fill="none" stroke="{DARK_LINE}" stroke-width="5" />
  </g>

  <!-- === 2. TEXTS & RED STAR === -->
  {render_texts(text_fill=WHITE, text_stroke="#040c1c", stroke_w=2.5, star_fill=UK_RED)}

  <!-- === 3. C U C LETTERS === -->
  {render_cuc_letters(u_fill=UK_RED, c_fill=SPORT_NAVY, u_stroke=DARK_LINE)}
</svg>
"""

# =========================================================================
# VARIATION 3: cuc-logo-uk-letters.svg (Union Jack in the Central U Letter)
# =========================================================================
svg_v3 = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    {make_ring_clips()}
    {make_union_jack_full()}
    <clipPath id="u-core-clip">
      <path d="{u_core}" />
    </clipPath>
  </defs>

  <!-- === 1. ROYAL NAVY & RED ACCENTED RING === -->
  <g clip-path="url(#ring-arcs-clip)">
    <!-- Ring Body -->
    <path d="M {CX},{CY - R_OUTER} 
             A {R_OUTER} {R_OUTER} 0 1 0 {CX},{CY + R_OUTER} 
             A {R_OUTER} {R_OUTER} 0 1 0 {CX},{CY - R_OUTER} 
             M {CX},{CY - R_INNER} 
             A {R_INNER} {R_INNER} 0 1 1 {CX},{CY + R_INNER} 
             A {R_INNER} {R_INNER} 0 1 1 {CX},{CY - R_INNER} Z" 
          fill="{UK_BLUE}" fill-rule="evenodd" />

    <!-- Concentric Accent Lines -->
    <circle cx="{CX}" cy="{CY}" r="{R_OUT_LINE}" fill="none" stroke="{DARK_LINE}" stroke-width="6" />
    <circle cx="{CX}" cy="{CY}" r="{R_OUT_LINE - 6}" fill="none" stroke="{UK_RED}" stroke-width="3" />
    <circle cx="{CX}" cy="{CY}" r="{R_OUTER}" fill="none" stroke="{WHITE}" stroke-width="3" />
    
    <circle cx="{CX}" cy="{CY}" r="{R_INNER}" fill="none" stroke="{WHITE}" stroke-width="3" />
    <circle cx="{CX}" cy="{CY}" r="{R_IN_LINE + 6}" fill="none" stroke="{UK_RED}" stroke-width="3" />
    <circle cx="{CX}" cy="{CY}" r="{R_IN_LINE}" fill="none" stroke="{DARK_LINE}" stroke-width="5" />
  </g>

  <!-- === 2. TEXTS & WHITE STAR === -->
  {render_texts(text_fill=WHITE, text_stroke="#040c1c", stroke_w=2.5, star_fill=WHITE)}

  <!-- === 3. C U C LETTERS WITH UNION JACK EMBEDDED IN U === -->
  {render_cuc_letters(u_core_content='<use href="#union-jack-full" />', c_fill=DARK_LINE, u_stroke=DARK_LINE)}
</svg>
"""

# =========================================================================
# VARIATION 4 (BONUS): cuc-logo-england-stgeorge.svg (Croix de Saint-Georges Angleterre)
# =========================================================================
svg_v4 = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    {make_ring_clips()}
    <g id="st-george-full">
      <!-- White Field -->
      <rect x="0" y="0" width="1024" height="1024" fill="{WHITE}" />
      <!-- Red St George Cross -->
      <rect x="{CX - 60}" y="0" width="120" height="1024" fill="{UK_RED}" />
      <rect x="0" y="{CY - 60}" width="1024" height="120" fill="{UK_RED}" />
    </g>
  </defs>

  <!-- === 1. RING WITH ST GEORGE CROSS PATTERN === -->
  <g clip-path="url(#ring-arcs-clip)">
    <!-- Base St George Pattern in Ring -->
    <g mask="url(#ring-donut-mask)">
      <use href="#st-george-full" />
    </g>

    <!-- Concentric Accent Lines -->
    <circle cx="{CX}" cy="{CY}" r="{R_OUT_LINE}" fill="none" stroke="{DARK_LINE}" stroke-width="6" />
    <circle cx="{CX}" cy="{CY}" r="{R_OUT_LINE - 6}" fill="none" stroke="{UK_RED}" stroke-width="3" />
    <circle cx="{CX}" cy="{CY}" r="{R_OUTER}" fill="none" stroke="{DARK_LINE}" stroke-width="2" />
    <circle cx="{CX}" cy="{CY}" r="{R_INNER}" fill="none" stroke="{DARK_LINE}" stroke-width="2" />
    <circle cx="{CX}" cy="{CY}" r="{R_IN_LINE + 6}" fill="none" stroke="{UK_RED}" stroke-width="3" />
    <circle cx="{CX}" cy="{CY}" r="{R_IN_LINE}" fill="none" stroke="{DARK_LINE}" stroke-width="5" />
  </g>

  <!-- === 2. TEXTS & STAR (DARK FOR MAXIMUM CONTRAST ON WHITE RING) === -->
  {render_texts(text_fill=DARK_LINE, text_stroke=WHITE, stroke_w=2.5, star_fill=UK_RED)}

  <!-- === 3. C U C CENTRAL LETTERS (RED U, BLACK C) === -->
  {render_cuc_letters(u_fill=UK_RED, c_fill=DARK_LINE, u_stroke=DARK_LINE)}
</svg>
"""

with open("public/images/logos/cuc-logo-uk-ring.svg", "w", encoding="utf-8") as f:
    f.write(svg_v1)

with open("public/images/logos/cuc-logo-uk-sport.svg", "w", encoding="utf-8") as f:
    f.write(svg_v2)

with open("public/images/logos/cuc-logo-uk-letters.svg", "w", encoding="utf-8") as f:
    f.write(svg_v3)

with open("public/images/logos/cuc-logo-england-stgeorge.svg", "w", encoding="utf-8") as f:
    f.write(svg_v4)

print("Generated 4 SVG logos in public/images/logos/!")
