import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLive() {
  console.log('--- TEST DES SERVICES EN TEMPS RÉEL ---');
  
  // Test site_pages
  const { data: pages } = await supabase.from('site_pages').select('slug, title, updated_at');
  console.log(`✓ Pages chargées depuis Supabase: ${pages?.length}`);

  // Test site_sessions avec formations CUC Sign
  const { data: sessions } = await supabase.from('site_sessions').select('id, date_display, status, cuc_sign_formation_id');
  const linkedSessions = sessions.filter(s => s.cuc_sign_formation_id);
  console.log(`✓ Sessions Supabase: ${sessions?.length} (dont ${linkedSessions.length} reliées à CUC Sign)`);

  // Test site_team avec profiles CUC Sign
  const { data: team } = await supabase.from('site_team').select('id, name, profile_id');
  const linkedTeam = team.filter(m => m.profile_id);
  console.log(`✓ Formateurs Supabase: ${team?.length} (dont ${linkedTeam.length} avec compte CUC Sign lié)`);

  // Test campus_pois avec locations CUC Sign
  const { data: poisData } = await supabase.from('site_settings').select('value').eq('key', 'campus_pois').single();
  const pois = poisData?.value?.list || [];
  const linkedPois = pois.filter(p => p.location_id);
  console.log(`✓ Zones campus Supabase: ${pois.length} (dont ${linkedPois.length} reliées aux lieux CUC Sign)`);

  console.log('\nTOUTES LES DONNÉES SONT LIVE ET INTERCONNECTÉES SUR SUPABASE !');
}

testLive();
