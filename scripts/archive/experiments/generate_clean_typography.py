"""
Script de génération des tracés vectoriels parfaits pour la typographie CUC
"CAMPUS" et "UNIVERS ★ CASCADES" sur arc circulaire.

Élimine tous les défauts de vectorisation raster (creux, bosses, crénelage).
Produit des glyphes géométriques purs avec angles nets à 45° et lignes droites.
"""

import math
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen

class TransformPen(BasePen):
    def __init__(self, glyphset, matrix):
        super().__init__(glyphset)
        self.a, self.b, self.c, self.d, self.e, self.f = matrix
        self.commands = []
        
    def _transform(self, pt):
        x, y = pt
        tx = self.a * x + self.c * y + self.e
        ty = self.b * x + self.d * y + self.f
        return round(tx, 2), round(ty, 2)

    def _moveTo(self, pt):
        x, y = self._transform(pt)
        self.commands.append(f"M {x},{y}")

    def _lineTo(self, pt):
        x, y = self._transform(pt)
        self.commands.append(f"L {x},{y}")

    def _curveToOne(self, pt1, pt2, pt3):
        x1, y1 = self._transform(pt1)
        x2, y2 = self._transform(pt2)
        x3, y3 = self._transform(pt3)
        self.commands.append(f"C {x1},{y1} {x2},{y2} {x3},{y3}")

    def _closePath(self):
        self.commands.append("Z")

    def get_d(self):
        return " ".join(self.commands)

def get_clean_cuc_text_vectors(font_path='scripts/assets/fonts/collegeb.ttf'):
    font = TTFont(font_path)
    glyph_set = font.getGlyphSet()

    CX = 512.0
    CY = 512.0

    # 1. CAMPUS (Centré à -90.00°, espacement proportionnel aux glyphes)
    # Empêche l'écrasement de 'M' et l'éloignement de 'U'-'S', échelle homogène 1.12
    top_specs = [
        ('C', -109.95, 1.12),
        ('A', -102.04, 1.12),
        ('M', -93.29,  1.12),
        ('P', -85.25,  1.12),
        ('U', -77.57,  1.12),
        ('S', -70.05,  1.12),
    ]

    # 2. UNIVERS ★ CASCADES (Espacement proportionnel, symétrie parfaite de 11.10° autour de l'étoile à 90.00°)
    # Élimine les trous béants autour du 'I', l'écrasement 'U'-'N', et équilibre CASCADES
    bot_specs = [
        # UNIVERS
        ('U', 136.49, 1.12),
        ('N', 129.71, 1.12),
        ('I', 124.59, 1.12),
        ('V', 119.44, 1.12),
        ('E', 113.34, 1.12),
        ('R', 107.30, 1.12),
        ('S', 101.10, 1.12),
        # CASCADES
        ('C', 78.90,  1.12),
        ('A', 72.78,  1.12),
        ('S', 67.10,  1.12),
        ('C', 62.09,  1.12),
        ('A', 55.97,  1.12),
        ('D', 50.23,  1.12),
        ('E', 45.45,  1.12),
        ('S', 39.95,  1.12),
    ]

    paths = []
    R_TOP = 416.0
    S_TOP = 52.0 / 1400.0
    for char, ang_deg, x_scale in top_specs:
        g = glyph_set[char]
        gw = g.width
        cx_f = gw / 2.0
        cy_f = 700.0
        
        ang_rad = math.radians(ang_deg)
        tx = CX + R_TOP * math.cos(ang_rad)
        ty = CY + R_TOP * math.sin(ang_rad)
        
        rot_rad = math.radians(ang_deg + 90.0)
        cos_r = math.cos(rot_rad)
        sin_r = math.sin(rot_rad)
        
        sx = S_TOP * x_scale
        sy = S_TOP
        
        a = cos_r * sx
        c = sin_r * sy
        e = tx - cos_r * sx * cx_f - sin_r * sy * cy_f
        
        b = sin_r * sx
        d = -cos_r * sy
        f = ty - sin_r * sx * cx_f + cos_r * sy * cy_f
        
        pen = TransformPen(glyph_set, [a, b, c, d, e, f])
        g.draw(pen)
        paths.append(pen.get_d())

    R_BOT = 416.5
    S_BOT = 45.5 / 1400.0
    for char, ang_deg, x_scale in bot_specs:
        g = glyph_set[char]
        gw = g.width
        cx_f = gw / 2.0
        cy_f = 700.0
        
        ang_rad = math.radians(ang_deg)
        tx = CX + R_BOT * math.cos(ang_rad)
        ty = CY + R_BOT * math.sin(ang_rad)
        
        rot_rad = math.radians(ang_deg - 90.0)
        cos_r = math.cos(rot_rad)
        sin_r = math.sin(rot_rad)
        
        sx = S_BOT * x_scale
        sy = S_BOT
        
        a = cos_r * sx
        c = sin_r * sy
        e = tx - cos_r * sx * cx_f - sin_r * sy * cy_f
        
        b = sin_r * sx
        d = -cos_r * sy
        f = ty - sin_r * sx * cx_f + cos_r * sy * cy_f
        
        pen = TransformPen(glyph_set, [a, b, c, d, e, f])
        g.draw(pen)
        paths.append(pen.get_d())

    # Étoile 5 branches parfaitement calibrée et centrée à CX = 512.0
    star_pts = [
        (512.0, 894.0),
        (503.5, 920.0),
        (476.0, 920.0),
        (498.0, 937.0),
        (490.0, 963.0),
        (512.0, 947.0),
        (534.0, 963.0),
        (526.0, 937.0),
        (548.0, 920.0),
        (520.5, 920.0),
    ]
    star_d = "M " + " L ".join(f"{x:.1f},{y:.1f}" for x, y in star_pts) + " Z"

    return paths, star_d

if __name__ == '__main__':
    paths, star_d = get_clean_cuc_text_vectors()
    print(f"Generated {len(paths)} clean text glyphs + 1 centered star.")
