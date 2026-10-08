import cv2
import numpy as np
import math
from fontTools.ttLib import TTFont

bw = cv2.imread('public/images/logos/cuc-logo-bw.png', cv2.IMREAD_UNCHANGED)
alpha = bw[:, :, 3]
gray = cv2.cvtColor(bw[:, :, :3], cv2.COLOR_BGR2GRAY)
white = ((alpha > 128) & (gray > 150)).astype(np.uint8) * 255

cnts, _ = cv2.findContours(white, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
items = []
for c in cnts:
    if cv2.contourArea(c) < 100: continue
    M = cv2.moments(c)
    if M['m00'] == 0: continue
    cx = M['m10'] / M['m00']
    cy = M['m01'] / M['m00'] + 16.0
    r = math.hypot(cx - 512.0, cy - 512.0)
    ang = math.degrees(math.atan2(cy - 512.0, cx - 512.0))
    x, y, w, h = cv2.boundingRect(c)
    items.append({'cx': cx, 'cy': cy, 'r': r, 'ang': ang, 'w': w, 'h': h})

top = sorted([it for it in items if it['cy'] < 512.0], key=lambda it: it['cx'])
bot = sorted([it for it in items if it['cy'] > 512.0], key=lambda it: it['cx'])

print("=== ORIGINAL CUC-LOGO-BW MEASUREMENTS (with DY=16, CX=512, CY=512) ===")
print("TOP (CAMPUS):")
prev_ang = None
for char, it in zip('CAMPUS', top):
    delta = (it['ang'] - prev_ang) if prev_ang is not None else 0
    print(f"  {char}: ang = {it['ang']:7.3f}° (delta = {delta:6.3f}°), r = {it['r']:.1f}, w = {it['w']}")
    prev_ang = it['ang']

print("\nBOTTOM (UNIVERS STAR CASCADES):")
chars = ['U', 'N', 'I', 'V', 'E', 'R', 'S', 'STAR', 'C', 'A', 'S', 'C', 'A', 'D', 'E', 'S']
prev_ang = None
for char, it in zip(chars, bot):
    delta = (it['ang'] - prev_ang) if prev_ang is not None else 0
    print(f"  {char:4s}: ang = {it['ang']:7.3f}° (delta = {delta:6.3f}°), r = {it['r']:.1f}, w = {it['w']}")
    prev_ang = it['ang']
