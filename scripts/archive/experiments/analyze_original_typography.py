import cv2
import numpy as np
import math

bw = cv2.imread('public/images/logos/cuc-logo-bw.png', cv2.IMREAD_UNCHANGED)
alpha = bw[:, :, 3]
gray = cv2.cvtColor(bw[:, :, :3], cv2.COLOR_BGR2GRAY)
white = ((alpha > 128) & (gray > 150)).astype(np.uint8) * 255

CX = 511.5
CY = 495.5

cnts, hier = cv2.findContours(white, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
print(f'Total contours: {len(cnts)}')

letters = []
for c in cnts:
    area = cv2.contourArea(c)
    if area < 100: continue
    M = cv2.moments(c)
    if M['m00'] == 0: continue
    cx = M['m10'] / M['m00']
    cy = M['m01'] / M['m00']
    r = math.sqrt((cx - CX)**2 + (cy - CY)**2)
    ang = math.degrees(math.atan2(cy - CY, cx - CX))
    x, y, w, h = cv2.boundingRect(c)
    letters.append({'cx': cx, 'cy': cy, 'r': r, 'ang': ang, 'w': w, 'h': h, 'area': area})

top_letters = ['C', 'A', 'M', 'P', 'U', 'S']
top = [l for l in letters if l['cy'] < CY]
top = sorted(top, key=lambda l: l['cx'])

print('\n--- TOP (CAMPUS) ORIGINAL ---')
for i, l in enumerate(top):
    char = top_letters[i] if i < len(top_letters) else '?'
    print(f"Char '{char}': cx={l['cx']:.1f}, cy={l['cy']:.1f}, r={l['r']:.1f}, ang={l['ang']:.2f}°, w={l['w']}, h={l['h']}")

bot_letters = ['U', 'N', 'I', 'V', 'E', 'R', 'S', 'STAR', 'C', 'A', 'S', 'C', 'A', 'D', 'E', 'S']
bot = [l for l in letters if l['cy'] > CY]
# Sort by x coordinate (left to right)
bot = sorted(bot, key=lambda l: l['cx'])

print('\n--- BOTTOM (UNIVERS STAR CASCADES) ORIGINAL ---')
for i, l in enumerate(bot):
    char = bot_letters[i] if i < len(bot_letters) else '?'
    print(f"Char '{char}': cx={l['cx']:.1f}, cy={l['cy']:.1f}, r={l['r']:.1f}, ang={l['ang']:.2f}°, w={l['w']}, h={l['h']}")
