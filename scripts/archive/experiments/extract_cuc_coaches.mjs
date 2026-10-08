import fs from 'fs';

const htmlPath = 'C:/Users/niels/.gemini/antigravity-ide/brain/572822af-6188-4d7e-b6b9-00aaa61cdd6b/.system_generated/steps/33/content.md';
let content = fs.readFileSync(htmlPath, 'utf8');

const coaches = [];

for (let row = 2; row <= 5; row++) {
  for (let col = 0; col <= 4; col++) {
    const imgPanelId = `panel-609-${row}-${col}-0`;
    const textPanelId = `panel-609-${row}-${col}-1`;
    
    // Find img panel chunk
    const imgPanelIdx = content.indexOf(`id="${imgPanelId}"`);
    const textPanelIdx = content.indexOf(`id="${textPanelId}"`);
    
    if (imgPanelIdx === -1 || textPanelIdx === -1) {
      console.warn(`Missing panel for row ${row}, col ${col}`);
      continue;
    }
    
    // Find next panel
    const nextPanelMatch = content.slice(textPanelIdx + 20).match(/id="panel-609-\d+-\d+-\d+"/);
    const endTextIdx = nextPanelMatch ? textPanelIdx + 20 + nextPanelMatch.index : textPanelIdx + 3000;
    
    const imgChunk = content.slice(imgPanelIdx, textPanelIdx);
    const textChunk = content.slice(textPanelIdx, endTextIdx);
    
    // Extract Image
    const srcMatch = imgChunk.match(/data-lazy-src="([^"]+)"/) || imgChunk.match(/src="([^"]+)"/);
    const titleMatch = imgChunk.match(/title="([^"]+)"/);
    const altMatch = imgChunk.match(/alt="([^"]+)"/);
    
    // Extract Text & Links
    const links = [...textChunk.matchAll(/href="([^"]+)"/gi)].map(m => m[1]);
    
    // Clean text
    // Replace <br> and <p> with newlines before stripping
    const cleanText = textChunk
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8217;/g, "'")
      .replace(/&#8211;/g, "-")
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .trim();
      
    const rawHtml = textChunk;

    coaches.push({
      index: coaches.length + 1,
      row,
      col,
      panelId: `609-${row}-${col}`,
      imageSrc: srcMatch ? srcMatch[1] : null,
      imageTitle: titleMatch ? titleMatch[1] : null,
      imageAlt: altMatch ? altMatch[1] : null,
      text: cleanText,
      links: [...new Set(links)],
      rawTextChunk: textChunk
    });
  }
}

console.log(`Extracted ${coaches.length} coaches!`);
fs.writeFileSync('scripts/cuc_20_coaches_scraped.json', JSON.stringify(coaches, null, 2), 'utf8');

coaches.forEach((c) => {
  console.log(`\n================== #${c.index} [Row ${c.row}, Col ${c.col}] ==================`);
  console.log(`Title: ${c.imageTitle}`);
  console.log(`Image: ${c.imageSrc}`);
  console.log(`Links:`, c.links);
  console.log(`Text lines:`);
  c.text.split('\n').filter(Boolean).forEach(l => console.log('  > ', l.trim()));
});
