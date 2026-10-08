import cv2
import numpy as np
import math
import os
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen

class TransformPen(BasePen):
    def __init__(self, glyphset, matrix):
        super().__init__(glyphset)
        self.a, self.b, self.c, self.d, self.e, self.f = matrix
        self.polys = []
        self.curr_poly = []
        
    def _transform(self, pt):
        x, y = pt
        tx = self.a * x + self.c * y + self.e
        ty = self.b * x + self.d * y + self.f
        return [float(tx), float(ty)]

    def _moveTo(self, pt):
        if self.curr_poly:
            self.polys.append(np.array(self.curr_poly, dtype=np.int32))
        self.curr_poly = [self._transform(pt)]

    def _lineTo(self, pt):
        self.curr_poly.append(self._transform(pt))

    def _curveToOne(self, pt1, pt2, pt3):
        # Flatten curve with 5 points
        p0 = self.curr_poly[-1]
        t_p1 = self._transform(pt1)
        t_p2 = self._transform(pt2)
        t_p3 = self._transform(pt3)
        for t in np.linspace(0.2, 1.0, 5):
            it = 1 - t
            x = it**3 * p0[0] + 3*it**2*t * t_p1[0] + 3*it*t**2 * t_p2[0] + t**3 * t_p3[0]
            y = it**3 * p0[1] + 3*it**2*t * t_p1[1] + 3*it*t**2 * t_p2[1] + t**3 * t_p3[1]
            self.curr_poly.append([x, y])

    def _closePath(self):
        if self.curr_poly:
            self.polys.append(np.array(self.curr_poly, dtype=np.int32))
            self.curr_poly = []

    def get_polys(self):
        if self.curr_poly:
            self.polys.append(np.array(self.curr_poly, dtype=np.int32))
            self.curr_poly = []
        return self.polys

def render_spec(specs_top, specs_bot, R_TOP=416.0, S_TOP=52.0/1400.0, R_BOT=416.5, S_BOT=45.5/1400.0, default_x_scale=1.12):
    font = TTFont('scripts/assets/fonts/collegeb.ttf')
    glyph_set = font.getGlyphSet()
    canvas = np.zeros((1024, 1024, 3), dtype=np.uint8)
    CX = 512.0
    CY = 512.0

    # Render top
    for item in specs_top:
        char, ang_deg = item[0], item[1]
        x_scale = item[2] if len(item) > 2 else default_x_scale
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
        for poly in pen.get_polys():
            cv2.fillPoly(canvas, [poly], (255, 255, 255))

    # Render bot
    for item in specs_bot:
        char, ang_deg = item[0], item[1]
        x_scale = item[2] if len(item) > 2 else default_x_scale
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
        for poly in pen.get_polys():
            cv2.fillPoly(canvas, [poly], (255, 255, 255))

    return canvas

# 1. Old equidistant specs
old_top = [
    ('C', -110.0, 1.15),
    ('A', -102.0, 1.20),
    ('M', -94.0,  1.22),
    ('P', -86.0,  1.15),
    ('U', -78.0,  1.15),
    ('S', -70.0,  1.15),
]
old_bot = [
    ('U', 136.50, 1.12),
    ('N', 130.67, 1.15),
    ('I', 124.83, 1.12),
    ('V', 119.00, 1.15),
    ('E', 113.17, 1.12),
    ('R', 107.33, 1.12),
    ('S', 101.50, 1.12),
    ('C', 78.50,  1.12),
    ('A', 72.93,  1.18),
    ('S', 67.36,  1.12),
    ('C', 61.79,  1.12),
    ('A', 56.21,  1.18),
    ('D', 50.64,  1.12),
    ('E', 45.07,  1.12),
    ('S', 39.50,  1.12),
]

# 2. Proportional specs based on exact measured positions from original cuc-logo-bw.png
# Adjusted for perfect symmetry
# Top CAMPUS:
# Measured: C: -109.92, A: -102.01, M: -93.26, P: -85.22, U: -77.54, S: -70.01
# Note: C is at -109.95, S is at -70.05. Center = -90.00.
# Delta C-A: 7.91, A-M: 8.75, M-P: 8.04, P-U: 7.68, U-S: 7.53
new_top = [
    ('C', -109.95, 1.12),
    ('A', -102.04, 1.12),
    ('M', -93.29,  1.12),
    ('P', -85.25,  1.12),
    ('U', -77.57,  1.12),
    ('S', -70.05,  1.12),
]

# Bottom:
# Measured:
# U: 136.56, N: 129.78, I: 124.66, V: 119.51, E: 113.42, R: 107.38, S: 101.18
# Gap to star (90.0): 101.18 - 90 = 11.18
# S to C (78.95): 90 - 78.95 = 11.05
# Let us make gap to star exactly 11.10 deg on both sides!
# S at 101.10 deg, C at 78.90 deg!
# Then:
# UNIVERS (relative to S at 101.10):
# R: 101.10 + 6.20 = 107.30
# E: 107.30 + 6.04 = 113.34
# V: 113.34 + 6.10 = 119.44
# I: 119.44 + 5.15 = 124.59
# N: 124.59 + 5.12 = 129.71
# U: 129.71 + 6.78 = 136.49
#
# CASCADES (relative to C at 78.90):
# A: 78.90 - 6.12 = 72.78
# S: 72.78 - 5.68 = 67.10
# C: 67.10 - 5.01 = 62.09
# A: 62.09 - 6.12 = 55.97
# D: 55.97 - 5.74 = 50.23
# E: 50.23 - 4.78 = 45.45
# S: 45.45 - 5.50 = 39.95

new_bot = [
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

img_old = render_spec(old_top, old_bot)
img_new = render_spec(new_top, new_bot)

# Load bw reference
bw = cv2.imread('public/images/logos/cuc-logo-bw.png', cv2.IMREAD_UNCHANGED)
bw_canvas = np.zeros((1024, 1024, 3), dtype=np.uint8)
bw_canvas[16:16+992, :1024] = bw[:, :, :3]

# Create comparison crops
# 1. Zoom on UNIVERS: x: 180 to 470, y: 730 to 930
crop_bw_univ = bw_canvas[740:930, 200:460]
crop_old_univ = img_old[740:930, 200:460]
crop_new_univ = img_new[740:930, 200:460]

# 2. Zoom on CAMPUS: x: 340 to 680, y: 50 to 140
crop_bw_camp = bw_canvas[50:140, 350:670]
crop_old_camp = img_old[50:140, 350:670]
crop_new_camp = img_new[50:140, 350:670]

# 3. Zoom on CASCADES: x: 580 to 860, y: 740 to 930
crop_bw_casc = bw_canvas[740:930, 580:850]
crop_old_casc = img_old[740:930, 580:850]
crop_new_casc = img_new[740:930, 580:850]

cv2.imwrite('.staging/comp_old_univ.png', crop_old_univ)
cv2.imwrite('.staging/comp_new_univ.png', crop_new_univ)
cv2.imwrite('.staging/comp_bw_univ.png', crop_bw_univ)

cv2.imwrite('.staging/comp_old_camp.png', crop_old_camp)
cv2.imwrite('.staging/comp_new_camp.png', crop_new_camp)
cv2.imwrite('.staging/comp_bw_camp.png', crop_bw_camp)

print('Rendered comparison crops successfully!')
