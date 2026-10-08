import cv2
import numpy as np
import os

# Base visual: use the cinematic stunt background from generated image
bg_path = 'C:/Users/niels/.gemini/antigravity-ide/brain/7f1dff03-a9df-4e34-b606-f7cb5abfba6e/international_workshop_ad_1791325759609.jpg'
bg = cv2.imread(bg_path)
H, W = bg.shape[:2]

# List of official CUC country logos to feature
logos_dir = 'public/images/logos'
featured_countries = [
    'france', 'usa', 'uk-ring', 'japan', 'germany',
    'australia', 'canada', 'spain', 'italy', 'brazil'
]

# We will create an advertising banner: 1920x1080
canvas = cv2.resize(bg, (1920, 1080))

# Add a subtle dark gradient at the bottom and top for typography contrast
overlay = canvas.copy()
cv2.rectangle(overlay, (0, 0), (1920, 160), (10, 10, 15), -1)
cv2.rectangle(overlay, (0, 880), (1920, 1080), (10, 10, 15), -1)
cv2.addWeighted(overlay, 0.75, canvas, 0.25, 0, canvas)

# Top Bar: Place the 10 real CUC flag logos in a sleek ribbon with glowing badges
num_logos = len(featured_countries)
logo_size = 110
gap = 25
total_w = num_logos * logo_size + (num_logos - 1) * gap
start_x = (1920 - total_w) // 2
y_pos = 25

for i, c_name in enumerate(featured_countries):
    filename = f'cuc-logo-{c_name}.png'
    p = os.path.join(logos_dir, filename)
    if os.path.exists(p):
        logo_img = cv2.imread(p, cv2.IMREAD_UNCHANGED)
        resized = cv2.resize(logo_img, (logo_size, logo_size), interpolation=cv2.INTER_AREA)
        
        lx = start_x + i * (logo_size + gap)
        ly = y_pos
        
        # Alpha blending with subtle shadow
        alpha = resized[:, :, 3] / 255.0
        # Draw soft glow / shadow behind
        cv2.circle(canvas, (lx + logo_size // 2, ly + logo_size // 2), logo_size // 2 + 6, (0, 0, 0), -1)
        
        for ch in range(3):
            canvas[ly:ly+logo_size, lx:lx+logo_size, ch] = (
                resized[:, :, ch] * alpha + canvas[ly:ly+logo_size, lx:lx+logo_size, ch] * (1.0 - alpha)
            ).astype(np.uint8)

# Output path
out_path = 'C:/Users/niels/.gemini/antigravity-ide/brain/7f1dff03-a9df-4e34-b606-f7cb5abfba6e/cuc_international_workshop_master_ad.jpg'
cv2.imwrite(out_path, canvas, [cv2.IMWRITE_JPEG_QUALITY, 95])
print(f'Master ad poster created at: {out_path}')
