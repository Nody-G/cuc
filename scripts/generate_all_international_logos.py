import json
import math
import os

with open("scratch/perfect_cuc_polys.json") as f:
    cuc = json.load(f)

with open("scratch/logo_data.json") as f:
    orig = json.load(f)

text_paths_raw = orig["text"]
star_path_raw  = orig["star"]

CX = 512.0
CY = 512.0
R_OUTER = 475.0
R_INNER = 356.0
R_OUT_LINE = 493.0
R_IN_LINE = 338.5

Y_CUT_TOP = 292.0
Y_CUT_BOTTOM = 750.0

WHITE = "#FFFFFF"
DARK_LINE = "#111111"

def shift_svg_path(d_str, dx=0.0, dy=0.0):
    if not d_str:
        return ""
    import re
    def repl(m):
        cmd = m.group(1)
        x = float(m.group(2)) + dx
        y = float(m.group(3)) + dy
        return f"{cmd} {x:.1f},{y:.1f}"
    return re.sub(r'([ML])\s*([-\d.]+),([-\d.]+)', repl, d_str)

# Star shifted by -5.0px to sit dead center at x = 512.0
star_path = shift_svg_path(star_path_raw, dx=-5.0, dy=0.0)

# U shifted by -0.5px to align with CX = 512.0
u_out   = shift_svg_path(cuc["u_out"], dx=-0.5)
u_white = shift_svg_path(cuc["u_white"], dx=-0.5)
u_core  = shift_svg_path(cuc["u_core"], dx=-0.5)

cl_black = cuc["cl_black"]
cl_white = cuc["cl_white"]
cr_black = cuc["cr_black"]
cr_white = cuc["cr_white"]

text_paths = []
for p in text_paths_raw:
    if " 6" in p[:30] or " 7" in p[:30] or " 5" in p[:30] or " 8" in p[:30]:
        text_paths.append(shift_svg_path(p, dx=1.5))
    else:
        text_paths.append(p)

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
    <filter id="text-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.9" />
    </filter>
    """

def render_texts(text_fill=WHITE, text_stroke=DARK_LINE, stroke_w=6, star_fill=None):
    if star_fill is None:
        star_fill = text_fill
    lines = []
    for d in text_paths:
        lines.append(f'<path d="{d}" fill="{text_fill}" stroke="{text_stroke}" stroke-width="{stroke_w}" stroke-linejoin="round" paint-order="stroke fill" fill-rule="evenodd" />')
    if star_path:
        lines.append(f'<path d="{star_path}" fill="{star_fill}" stroke="{text_stroke}" stroke-width="{stroke_w}" stroke-linejoin="round" paint-order="stroke fill" fill-rule="evenodd" />')
    return "\n      ".join(lines)

def render_cuc_letters(u_core_content=None, u_fill="#C8102E", c_fill=DARK_LINE, u_stroke=DARK_LINE):
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
      <!-- Center U -->
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

def build_flag_logo(flag_svg_group, u_fill, border_accent=WHITE, text_fill=WHITE, text_stroke=DARK_LINE, star_fill=None, u_content=None, c_fill=DARK_LINE):
    if star_fill is None:
        star_fill = text_fill
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    {make_ring_clips()}
    {flag_svg_group}
    <clipPath id="u-core-clip">
      <path d="{u_core}" />
    </clipPath>
  </defs>

  <!-- === 1. RING WITH FLAG PATTERN === -->
  <g clip-path="url(#ring-arcs-clip)">
    <!-- Base Flag Graphic -->
    <g mask="url(#ring-donut-mask)">
      <use href="#flag-pattern" />
    </g>

    <!-- Outermost Accent Lines -->
    <circle cx="{CX}" cy="{CY}" r="{R_OUT_LINE}" fill="none" stroke="{DARK_LINE}" stroke-width="6" />
    <circle cx="{CX}" cy="{CY}" r="{R_OUT_LINE - 6}" fill="none" stroke="{border_accent}" stroke-width="3" />
    <circle cx="{CX}" cy="{CY}" r="{R_OUTER}" fill="none" stroke="{WHITE}" stroke-width="3" />
    
    <!-- Innermost Accent Lines -->
    <circle cx="{CX}" cy="{CY}" r="{R_INNER}" fill="none" stroke="{WHITE}" stroke-width="3" />
    <circle cx="{CX}" cy="{CY}" r="{R_IN_LINE + 6}" fill="none" stroke="{border_accent}" stroke-width="3" />
    <circle cx="{CX}" cy="{CY}" r="{R_IN_LINE}" fill="none" stroke="{DARK_LINE}" stroke-width="5" />
  </g>

  <!-- === 2. TEXTS & STAR (PERFECTLY CENTERED AT 512.0) === -->
  <g filter="url(#text-glow)">
    {render_texts(text_fill=text_fill, text_stroke=text_stroke, stroke_w=7, star_fill=star_fill)}
  </g>

  <!-- === 3. C U C LETTERS === -->
  {render_cuc_letters(u_core_content=u_content, u_fill=u_fill, c_fill=c_fill, u_stroke=DARK_LINE)}
</svg>
"""

def svg_star(cx, cy, r_outer, r_inner, fill):
    points = []
    for i in range(10):
        angle = (i * 36 - 90) * math.pi / 180
        r = r_outer if i % 2 == 0 else r_inner
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        points.append(f"{x:.1f},{y:.1f}")
    return f'<polygon points="{" ".join(points)}" fill="{fill}" />'

countries = {}

# 1. FRANCE
countries["france"] = {
    "u_fill": "#ED2939",
    "border_accent": "#002395",
    "star_fill": "#ED2939",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="341.3" height="1024" fill="#002395" />
      <rect x="341.3" y="0" width="341.4" height="1024" fill="#FFFFFF" />
      <rect x="682.7" y="0" width="341.3" height="1024" fill="#ED2939" />
    </g>
    """
}

# 2. USA
usa_stripes = []
stripe_h = 1024 / 13
for i in range(13):
    col = "#B22234" if i % 2 == 0 else "#FFFFFF"
    usa_stripes.append(f'<rect x="0" y="{i*stripe_h:.1f}" width="1024" height="{stripe_h+0.5:.1f}" fill="{col}" />')
usa_stars = []
for row in range(5):
    for col in range(6):
        usa_stars.append(svg_star(50 + col * 75, 40 + row * 65, 14, 6, "#FFFFFF"))

countries["usa"] = {
    "u_fill": "#B22234",
    "border_accent": "#3C3B6E",
    "star_fill": "#FFFFFF",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      {''.join(usa_stripes)}
      <rect x="0" y="0" width="512" height="394" fill="#3C3B6E" />
      {''.join(usa_stars)}
    </g>
    """
}

# 3. JAPAN (Rising Red Sun across the ring)
countries["japan"] = {
    "u_fill": "#BC002D",
    "border_accent": "#BC002D",
    "star_fill": "#BC002D",
    "text_fill": DARK_LINE, "text_stroke": WHITE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="1024" fill="#FFFFFF" />
      <!-- Giant Red Sun disc intersecting the ring -->
      <circle cx="512" cy="512" r="440" fill="#BC002D" />
    </g>
    """
}

# 4. GERMANY (Black, Red, Gold visible on both arcs)
countries["germany"] = {
    "u_fill": "#FFCE00",
    "border_accent": "#DD0000",
    "star_fill": "#FFCE00",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="156" fill="#000000" />
      <rect x="0" y="156" width="1024" height="715" fill="#DD0000" />
      <rect x="0" y="871" width="1024" height="153" fill="#FFCE00" />
    </g>
    """
}

# 5. SPAIN (Red, Yellow, Red visible on both arcs)
countries["spain"] = {
    "u_fill": "#F1BF00",
    "border_accent": "#AA151B",
    "star_fill": "#AA151B",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="130" fill="#AA151B" />
      <rect x="0" y="130" width="1024" height="764" fill="#F1BF00" />
      <rect x="0" y="894" width="1024" height="130" fill="#AA151B" />
    </g>
    """
}

# 6. ITALY
countries["italy"] = {
    "u_fill": "#CE2B37",
    "border_accent": "#009246",
    "star_fill": "#CE2B37",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="341.3" height="1024" fill="#009246" />
      <rect x="341.3" y="0" width="341.4" height="1024" fill="#FFFFFF" />
      <rect x="682.7" y="0" width="341.3" height="1024" fill="#CE2B37" />
    </g>
    """
}

# 7. CANADA (Red maple leaves placed clearly on the top and bottom arcs)
maple_leaf_top = """
<g transform="translate(512, 175) scale(0.7) translate(-512, -490)">
  <polygon points="512,380 528,425 558,415 548,445 585,455 570,475 600,490 565,510 575,535 535,530 520,560 515,610 509,610 504,560 489,530 449,535 459,510 424,490 454,475 439,455 476,445 466,415 496,425" fill="#FF0000" />
</g>
"""
countries["canada"] = {
    "u_fill": "#FF0000",
    "border_accent": "#FF0000",
    "star_fill": "#FF0000",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="256" height="1024" fill="#FF0000" />
      <rect x="256" y="0" width="512" height="1024" fill="#FFFFFF" />
      <rect x="768" y="0" width="256" height="1024" fill="#FF0000" />
      {maple_leaf_top}
    </g>
    """
}

# 8. AUSTRALIA
sc_stars = [
    svg_star(256, 850, 48, 20, "#FFFFFF"),
    svg_star(750, 180, 26, 11, "#FFFFFF"),
    svg_star(860, 240, 26, 11, "#FFFFFF"),
    svg_star(750, 850, 26, 11, "#FFFFFF"),
    svg_star(660, 800, 26, 11, "#FFFFFF"),
    svg_star(830, 880, 18, 8, "#FFFFFF")
]
countries["australia"] = {
    "u_fill": "#00008B",
    "border_accent": "#FFCC00",
    "star_fill": "#FFCC00",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="1024" fill="#00008B" />
      <g transform="scale(0.5)">
        <rect x="0" y="0" width="1024" height="1024" fill="#012169" />
        <line x1="0" y1="0" x2="1024" y2="1024" stroke="#FFFFFF" stroke-width="110" />
        <line x1="1024" y1="0" x2="0" y2="1024" stroke="#FFFFFF" stroke-width="110" />
        <polygon points="0,0 20,0 512,492 492,512 0,20" fill="#C8102E" />
        <polygon points="512,532 532,512 1024,1004 1024,1024 1004,1024" fill="#C8102E" />
        <polygon points="1024,0 1024,20 532,512 512,492 1004,0" fill="#C8102E" />
        <polygon points="0,1024 0,1004 492,512 512,532 20,1024" fill="#C8102E" />
        <rect x="427" y="0" width="170" height="1024" fill="#FFFFFF" />
        <rect x="0" y="427" width="1024" height="170" fill="#FFFFFF" />
        <rect x="462" y="0" width="100" height="1024" fill="#C8102E" />
        <rect x="0" y="462" width="1024" height="100" fill="#C8102E" />
      </g>
      {''.join(sc_stars)}
    </g>
    """
}

# 9. SOUTH KOREA (Taegeuk scaled to cross the ring arcs)
countries["south-korea"] = {
    "u_fill": "#CD2E3A",
    "border_accent": "#0047A0",
    "star_fill": "#0047A0",
    "text_fill": DARK_LINE, "text_stroke": WHITE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="1024" fill="#FFFFFF" />
      <g transform="translate(512, 512) scale(2.4)">
        <path d="M 0,-180 A 180,180 0 0,1 0,180 A 90,90 0 0,1 0,0 A 90,90 0 0,0 0,-180 Z" fill="#CD2E3A" />
        <path d="M 0,180 A 180,180 0 0,1 0,-180 A 90,90 0 0,1 0,0 A 90,90 0 0,0 0,180 Z" fill="#0047A0" />
      </g>
      <rect x="180" y="140" width="30" height="100" fill="#000000" transform="rotate(-45 180 140)" />
      <rect x="220" y="100" width="30" height="100" fill="#000000" transform="rotate(-45 220 100)" />
      <rect x="800" y="780" width="30" height="100" fill="#000000" transform="rotate(-45 800 780)" />
      <rect x="840" y="740" width="30" height="100" fill="#000000" transform="rotate(-45 840 740)" />
    </g>
    """
}

# 10. CHINA
cn_stars = [
    svg_star(220, 180, 65, 28, "#FFDE00"),
    svg_star(330, 110, 22, 9, "#FFDE00"),
    svg_star(380, 160, 22, 9, "#FFDE00"),
    svg_star(380, 230, 22, 9, "#FFDE00"),
    svg_star(330, 280, 22, 9, "#FFDE00")
]
countries["china"] = {
    "u_fill": "#FFDE00",
    "border_accent": "#FFDE00",
    "star_fill": "#FFDE00",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="1024" fill="#DE2910" />
      {''.join(cn_stars)}
    </g>
    """
}

# 11. BRAZIL (Rhombus and Celestial Disc intersecting ring)
countries["brazil"] = {
    "u_fill": "#FEDD00",
    "border_accent": "#009739",
    "star_fill": "#FEDD00",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="1024" fill="#009739" />
      <polygon points="512,80 960,512 512,944 64,512" fill="#FEDD00" />
      <circle cx="512" cy="512" r="390" fill="#012169" />
      <path d="M 180,560 A 400,400 0 0,1 844,460 A 420,420 0 0,0 180,560 Z" fill="#FFFFFF" />
    </g>
    """
}

# 12. MEXICO
countries["mexico"] = {
    "u_fill": "#CE1126",
    "border_accent": "#006847",
    "star_fill": "#CE1126",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="341.3" height="1024" fill="#006847" />
      <rect x="341.3" y="0" width="341.4" height="1024" fill="#FFFFFF" />
      <rect x="682.7" y="0" width="341.3" height="1024" fill="#CE1126" />
      <circle cx="512" cy="180" r="45" fill="#D4AF37" opacity="0.95" />
      <circle cx="512" cy="840" r="45" fill="#D4AF37" opacity="0.95" />
    </g>
    """
}

# 13. SWEDEN
countries["sweden"] = {
    "u_fill": "#FECC00",
    "border_accent": "#FECC00",
    "star_fill": "#FECC00",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="1024" fill="#006AA7" />
      <rect x="340" y="0" width="130" height="1024" fill="#FECC00" />
      <rect x="0" y="447" width="1024" height="130" fill="#FECC00" />
    </g>
    """
}

# 14. SWITZERLAND (Greek Cross crossing the ring)
countries["switzerland"] = {
    "u_fill": "#DA291C",
    "border_accent": "#FFFFFF",
    "star_fill": "#FFFFFF",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="1024" fill="#DA291C" />
      <!-- Vertical and horizontal white cross bars crossing the ring -->
      <rect x="437" y="0" width="150" height="1024" fill="#FFFFFF" />
      <rect x="0" y="437" width="1024" height="150" fill="#FFFFFF" />
    </g>
    """
}

# 15. BELGIUM
countries["belgium"] = {
    "u_fill": "#FDDA24",
    "border_accent": "#EF3340",
    "star_fill": "#FDDA24",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="341.3" height="1024" fill="#000000" />
      <rect x="341.3" y="0" width="341.4" height="1024" fill="#FDDA24" />
      <rect x="682.7" y="0" width="341.3" height="1024" fill="#EF3340" />
    </g>
    """
}

# 16. NETHERLANDS (Red, White, Blue on arcs + Royal Dutch Orange U)
countries["netherlands"] = {
    "u_fill": "#FF4F00",  # Royal Dutch Orange
    "border_accent": "#21468B",
    "star_fill": "#FF4F00",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="156" fill="#AE1C28" />
      <rect x="0" y="156" width="1024" height="715" fill="#FFFFFF" />
      <rect x="0" y="871" width="1024" height="153" fill="#21468B" />
    </g>
    """
}

# 17. IRELAND
countries["ireland"] = {
    "u_fill": "#169B62",
    "border_accent": "#FF883E",
    "star_fill": "#169B62",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="341.3" height="1024" fill="#169B62" />
      <rect x="341.3" y="0" width="341.4" height="1024" fill="#FFFFFF" />
      <rect x="682.7" y="0" width="341.3" height="1024" fill="#FF883E" />
    </g>
    """
}

# 18. NORWAY
countries["norway"] = {
    "u_fill": "#00205B",
    "border_accent": "#BA0C2F",
    "star_fill": "#BA0C2F",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="1024" fill="#BA0C2F" />
      <rect x="310" y="0" width="180" height="1024" fill="#FFFFFF" />
      <rect x="0" y="422" width="1024" height="180" fill="#FFFFFF" />
      <rect x="355" y="0" width="90" height="1024" fill="#00205B" />
      <rect x="0" y="467" width="1024" height="90" fill="#00205B" />
    </g>
    """
}

# 19. SOUTH AFRICA
countries["south-africa"] = {
    "u_fill": "#007A3D",
    "border_accent": "#FFB612",
    "star_fill": "#FFB612",
    "text_fill": WHITE, "text_stroke": DARK_LINE,
    "flag": f"""
    <g id="flag-pattern">
      <rect x="0" y="0" width="1024" height="512" fill="#DE3831" />
      <rect x="0" y="512" width="1024" height="512" fill="#002395" />
      <polygon points="0,0 480,512 0,1024" fill="#FFFFFF" />
      <rect x="420" y="420" width="604" height="184" fill="#FFFFFF" />
      <polygon points="0,60 420,512 0,964" fill="#007A3D" />
      <rect x="420" y="452" width="604" height="120" fill="#007A3D" />
      <polygon points="0,140 350,512 0,884" fill="#FFB612" />
      <polygon points="0,200 290,512 0,824" fill="#000000" />
    </g>
    """
}

# Write the 19 SVG files
out_dir = "public/images/logos"
for country_key, c_info in countries.items():
    svg_content = build_flag_logo(
        flag_svg_group=c_info["flag"],
        u_fill=c_info["u_fill"],
        border_accent=c_info["border_accent"],
        star_fill=c_info["star_fill"],
        text_fill=c_info.get("text_fill", WHITE),
        text_stroke=c_info.get("text_stroke", DARK_LINE)
    )
    file_path = os.path.join(out_dir, f"cuc-logo-{country_key}.svg")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {file_path}")

# St George UK logo (with exact center 512.0)
st_george_flag = f"""
<g id="flag-pattern">
  <rect x="0" y="0" width="1024" height="1024" fill="{WHITE}" />
  <rect x="{CX - 60}" y="0" width="120" height="1024" fill="#C8102E" />
  <rect x="0" y="{CY - 60}" width="1024" height="120" fill="#C8102E" />
</g>
"""
svg_stgeorge = build_flag_logo(
    flag_svg_group=st_george_flag,
    u_fill="#C8102E",
    border_accent="#C8102E",
    text_fill=DARK_LINE,
    text_stroke=WHITE,
    star_fill="#C8102E"
)
with open(os.path.join(out_dir, "cuc-logo-england-stgeorge.svg"), "w", encoding="utf-8") as f:
    f.write(svg_stgeorge)

# UK Ring logo (with exact center 512.0)
uj_full = f"""
<g id="flag-pattern">
  <rect x="0" y="0" width="1024" height="1024" fill="#012169" />
  <line x1="0" y1="0" x2="1024" y2="1024" stroke="{WHITE}" stroke-width="110" />
  <line x1="1024" y1="0" x2="0" y2="1024" stroke="{WHITE}" stroke-width="110" />
  <polygon points="0,0 20,0 512,492 492,512 0,20" fill="#C8102E" />
  <polygon points="512,532 532,512 1024,1004 1024,1024 1004,1024" fill="#C8102E" />
  <polygon points="1024,0 1024,20 532,512 512,492 1004,0" fill="#C8102E" />
  <polygon points="0,1024 0,1004 492,512 512,532 20,1024" fill="#C8102E" />
  <rect x="{CX - 85}" y="0" width="170" height="1024" fill="{WHITE}" />
  <rect x="0" y="{CY - 85}" width="1024" height="170" fill="{WHITE}" />
  <rect x="{CX - 50}" y="0" width="100" height="1024" fill="#C8102E" />
  <rect x="0" y="{CY - 50}" width="1024" height="100" fill="#C8102E" />
</g>
"""
svg_uk_ring = build_flag_logo(
    flag_svg_group=uj_full,
    u_fill="#C8102E",
    border_accent=WHITE,
    text_fill=WHITE,
    text_stroke=DARK_LINE,
    star_fill=WHITE
)
with open(os.path.join(out_dir, "cuc-logo-uk-ring.svg"), "w", encoding="utf-8") as f:
    f.write(svg_uk_ring)

print("Regenerated all SVGs with perfected center-aligned elements!")
