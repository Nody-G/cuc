async function checkStages() {
  const r1 = await fetch('https://www.campus-universcascades.com/stages-cascades-parkour-2/');
  const t1 = await r1.text();
  const r2 = await fetch('https://www.campus-universcascades.com/stages-cascades-parkour-2-2/');
  const t2 = await r2.text();
  console.log('r1 length:', t1.length, 'r2 length:', t2.length);
  const clean1 = t1.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const clean2 = t2.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  console.log('Stages 1 excerpt:', clean1.slice(300, 700));
  console.log('Stages 2 excerpt:', clean2.slice(300, 700));
}
checkStages();
