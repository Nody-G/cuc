import cv2
import numpy as np
import json
import os

# Load cuc-logo-bw.png
bw_path = "public/images/logos/cuc-logo-bw.png"
bw = cv2.imread(bw_path, cv2.IMREAD_UNCHANGED)
h, w, _ = bw.shape
alpha = bw[:, :, 3]
gray = cv2.cvtColor(bw[:, :, :3], cv2.COLOR_BGR2GRAY)
black = ((alpha > 128) & (gray < 50)).astype(np.uint8) * 255
white = ((alpha > 128) & (gray > 150)).astype(np.uint8) * 255

# Coordinate offset to center the 1024x992 logo into a perfect 1024x1024 canvas
# Center of circle was cx = 511.5, cy = 495.5.
# With dy = 16.5 (or dy = 16), cx becomes 512, cy becomes 512!
DY = 16.0
CX = 512.0
CY = 512.0
R_OUTER = 475.0
R_INNER = 356.0
R_OUTER_LINE = 493.0
R_INNER_LINE = 338.5

# 1. Extract arched text paths
cnts_w, hier_w = cv2.findContours(white, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_KCOS)

def cnt_to_svg_subpath(cnt):
    pts = cnt.reshape(-1, 2)
    return "M " + " L ".join(f"{p[0]:.1f},{p[1] + DY:.1f}" for p in pts) + " Z"

text_paths = []
star_path = None
for i in range(len(cnts_w)):
    if hier_w[0, i, 3] == -1:
        # Check if this contour is the star
        x, y, cw, ch = cv2.boundingRect(cnts_w[i])
        d = cnt_to_svg_subpath(cnts_w[i])
        ch_idx = hier_w[0, i, 2]
        while ch_idx != -1:
            d += " " + cnt_to_svg_subpath(cnts_w[ch_idx])
            ch_idx = hier_w[0, ch_idx, 0]
        if y > 850 and x > 470 and x < 550:
            star_path = d
        else:
            text_paths.append(d)

print(f"Text paths count: {len(text_paths)}, Star found: {star_path is not None}")

# 2. Extract letter polygons for Left C, U, Right C
def get_letter_polys(x1, x2):
    region_black = np.zeros_like(black)
    region_black[290:720, x1:x2] = black[290:720, x_start:x_end] if 'x_start' in locals() else black[290:720, x1:x2]
    cnts, _ = cv2.findContours(region_black, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
    
    outer = cv2.approxPolyDP(cnts[0], 1.2, True).reshape(-1, 2)
    
    mask_outer = np.zeros_like(black)
    cv2.drawContours(mask_outer, [outer], -1, 255, -1)
    
    # Inline: alpha == 0 inside outer
    mask_inline = (mask_outer > 0) & (alpha == 0)
    cnts_in, _ = cv2.findContours(mask_inline.astype(np.uint8)*255, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts_in = [c for c in cnts_in if cv2.contourArea(c) > 5000]
    inline = cv2.approxPolyDP(cnts_in[0], 1.2, True).reshape(-1, 2) if cnts_in else None
    
    # Core
    core = None
    if len(cnts) > 1 and cv2.contourArea(cnts[1]) > 5000:
        # Check area: if area is > 40000, it's either inline border or core
        if len(cnts) > 2 and cv2.contourArea(cnts[2]) > 30000:
            core = cv2.approxPolyDP(cnts[2], 1.2, True).reshape(-1, 2)
        else:
            core = cv2.approxPolyDP(cnts[1], 1.2, True).reshape(-1, 2)
            
    return outer, inline, core

c_l_out, c_l_in, c_l_core = get_letter_polys(0, 330)
u_out, u_in, u_core = get_letter_polys(330, 695)
c_r_out, c_r_in, c_r_core = get_letter_polys(700, 1024)

def poly_to_d(pts):
    if pts is None:
        return ""
    return "M " + " L ".join(f"{p[0]:.1f},{p[1] + DY:.1f}" for p in pts) + " Z"

cl_out_d = poly_to_d(c_l_out)
cl_in_d  = poly_to_d(c_l_in)
cl_core_d = poly_to_d(c_l_core)

u_out_d  = poly_to_d(u_out)
u_in_d   = poly_to_d(u_in)
u_core_d = poly_to_d(u_core)

cr_out_d = poly_to_d(c_r_out)
cr_in_d  = poly_to_d(c_r_in)
cr_core_d = poly_to_d(c_r_core)

# Save intermediate data for inspection
with open("scratch/logo_data.json", "w") as f:
    json.dump({
        "cl": {"out": cl_out_d, "in": cl_in_d, "core": cl_core_d},
        "u":  {"out": u_out_d,  "in": u_in_d,  "core": u_core_d},
        "cr": {"out": cr_out_d, "in": cr_in_d, "core": cr_core_d},
        "text": text_paths,
        "star": star_path
    }, f)

print("Vectors extracted successfully!")
