import { CUC_TEAM } from '../src/data/team.ts';

console.log('Nombre total de coachs dans CUC_TEAM :', CUC_TEAM.length);
for (let i = 0; i < CUC_TEAM.length; i++) {
  const c = CUC_TEAM[i];
  console.log(`\n--- [${i + 1}/${CUC_TEAM.length}] ${c.name} (${c.id}) ---`);
  console.log(`Role: ${c.role}`);
  console.log(`Title: ${c.title}`);
  console.log(`Specialties: ${(c.specialties || []).join(', ')}`);
  console.log(`Bio actuelle: ${c.bio || 'AUCUNE'}`);
  console.log(`Notable credits: ${(c.notableCredits || []).slice(0, 3).join(' | ')}`);
}
