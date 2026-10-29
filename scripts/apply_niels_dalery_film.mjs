import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateSupabase() {
  console.log('=== Mise à jour Supabase pour Niels Dalery ===');

  // 1. site_team : niels-dalery
  const { data: teamRow, error: teamErr } = await supabase
    .from('site_team')
    .select('*')
    .eq('id', 'niels-dalery')
    .single();

  if (teamErr) {
    console.error('Erreur lecture site_team:', teamErr);
  } else {
    console.log('Actuel site_team:', {
      notable_credits: teamRow.notable_credits,
      featured_credits: teamRow.featured_credits,
      film_roles: teamRow.metadata?.film_roles,
    });

    const updatedMetadata = {
      ...(teamRow.metadata || {}),
      film_roles: {
        'loin-du-periph': 'Cascadeur',
      },
    };

    const { error: updateTeamErr } = await supabase
      .from('site_team')
      .update({
        notable_credits: ['Loin du périph (2022) — Cascadeur'],
        featured_credits: ['Loin du périph (2022) — Cascadeur'],
        metadata: updatedMetadata,
      })
      .eq('id', 'niels-dalery');

    if (updateTeamErr) {
      console.error('Erreur mise à jour site_team:', updateTeamErr);
    } else {
      console.log('✓ site_team mis à jour avec succès : notable_credits = ["Loin du périph (2022) — Cascadeur"]');
    }
  }

  // 2. site_films : loin-du-periph
  const { data: fPeriph, error: fPeriphErr } = await supabase
    .from('site_films')
    .select('*')
    .eq('id', 'loin-du-periph')
    .single();

  if (fPeriphErr) {
    console.error('Erreur lecture loin-du-periph:', fPeriphErr);
  } else {
    const involved = Array.isArray(fPeriph.cuc_team_involved) ? fPeriph.cuc_team_involved : [];
    const newInvolved = involved.includes('niels-dalery') ? involved : [...involved, 'niels-dalery'];
    const newRoles = {
      ...(fPeriph.metadata?.cuc_team_roles || {}),
      'niels-dalery': 'Cascadeur',
    };
    const newMeta = {
      ...(fPeriph.metadata || {}),
      cuc_team_roles: newRoles,
    };

    const { error: updatePeriphErr } = await supabase
      .from('site_films')
      .update({
        cuc_team_involved: newInvolved,
        metadata: newMeta,
      })
      .eq('id', 'loin-du-periph');

    if (updatePeriphErr) {
      console.error('Erreur mise à jour loin-du-periph:', updatePeriphErr);
    } else {
      console.log('✓ site_films "loin-du-periph" mis à jour avec niels-dalery (Cascadeur).');
    }
  }

  // 3. site_films : sous-la-seine
  const { data: fSeine, error: fSeineErr } = await supabase
    .from('site_films')
    .select('*')
    .eq('id', 'sous-la-seine')
    .single();

  if (fSeineErr) {
    console.error('Erreur lecture sous-la-seine:', fSeineErr);
  } else {
    const involved = Array.isArray(fSeine.cuc_team_involved) ? fSeine.cuc_team_involved : [];
    const newInvolved = involved.filter((id) => id !== 'niels-dalery');
    const newRoles = { ...(fSeine.metadata?.cuc_team_roles || {}) };
    delete newRoles['niels-dalery'];
    const newDetail = { ...(fSeine.metadata?.cuc_team_roles_detail || {}) };
    delete newDetail['niels-dalery'];

    const newMeta = {
      ...(fSeine.metadata || {}),
      cuc_team_roles: newRoles,
      cuc_team_roles_detail: newDetail,
    };

    const { error: updateSeineErr } = await supabase
      .from('site_films')
      .update({
        cuc_team_involved: newInvolved,
        metadata: newMeta,
      })
      .eq('id', 'sous-la-seine');

    if (updateSeineErr) {
      console.error('Erreur mise à jour sous-la-seine:', updateSeineErr);
    } else {
      console.log('✓ site_films "sous-la-seine" vérifié et nettoyé de niels-dalery.');
    }
  }
}

updateSupabase();
