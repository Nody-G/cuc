import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const isWrite = process.argv.includes('--write');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Erreur : variables SUPABASE manquantes.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  console.log(`=== MIGRATION COMPTES ADMIN & NETTOYAGE ADRESSES FACTICES (${isWrite ? 'APPLICATION' : 'ESSAI À BLANC'}) ===\n`);

  // 1. Lister les comptes @cuc.fr à supprimer
  const { data: authList, error: authListErr } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (authListErr) {
    console.error('Erreur listUsers:', authListErr);
    process.exit(1);
  }

  const cucUsers = authList.users.filter((u) => u.email?.endsWith('@cuc.fr'));
  console.log(`[1] Comptes @cuc.fr identifiés dans Supabase Auth : ${cucUsers.length}`);
  cucUsers.forEach((u) => console.log(`   - ${u.email} (${u.id})`));

  const { data: cucProfiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .like('email', '%@cuc.fr');

  if (profErr) {
    console.error('Erreur profiles:', profErr);
    process.exit(1);
  }
  console.log(`[2] Profils @cuc.fr identifiés dans la table profiles : ${cucProfiles.length}`);
  cucProfiles.forEach((p) => console.log(`   - ${p.email} [${p.role}] (${p.id})`));

  // 2. Vérifier le compte Niels Dalery
  const nielsAuth = authList.users.find((u) => u.email === 'niels.dalery@gmail.com');
  console.log('\n[3] Compte Niels Dalery :');
  if (nielsAuth) {
    console.log(`   - Auth ID : ${nielsAuth.id} (metadata role: ${nielsAuth.user_metadata?.role})`);
  } else {
    console.log('   - Non trouvé dans auth.users !');
  }

  // 3. Vérifier ou préparer Lucas Dollfus
  const lucasEmail = 'lucas.d@campus-universcascades.com';
  const lucasAuth = authList.users.find((u) => u.email === lucasEmail);
  console.log(`\n[4] Compte Lucas Dollfus (${lucasEmail}) :`);
  if (lucasAuth) {
    console.log(`   - Déjà présent avec l'ID : ${lucasAuth.id}`);
  } else {
    console.log(`   - Sera créé avec le rôle admin.`);
  }

  if (!isWrite) {
    console.log('\n=== FIN DU TEST À BLANC ===');
    console.log('Pour appliquer ces modifications réelles, exécutez :');
    console.log('node scripts/migrate_real_admin_accounts.mjs --write\n');
    return;
  }

  console.log('\n>>> DÉBUT DES MODIFICATIONS (--write) <<<\n');

  // A. Mettre à jour site_team pour détacher les anciens profile_id @cuc.fr
  const cucIds = cucProfiles.map((p) => p.id);
  console.log('Détachement des profile_id factices dans site_team...');
  const { error: teamUpdateErr } = await supabase
    .from('site_team')
    .update({ profile_id: null })
    .in('profile_id', cucIds);

  if (teamUpdateErr) {
    console.error('Erreur détachage site_team:', teamUpdateErr.message);
  } else {
    console.log('   ✓ site_team mis à jour');
  }

  // B. Supprimer les lignes de students rattachées aux faux comptes @cuc.fr
  console.log('Suppression des entrées students factices...');
  const { error: studentsErr } = await supabase
    .from('students')
    .delete()
    .in('user_id', cucIds);

  if (studentsErr) {
    console.warn('Avertissement suppression students:', studentsErr.message);
  } else {
    console.log('   ✓ students nettoyés');
  }

  // C. Supprimer les lignes profiles @cuc.fr
  console.log('Suppression des profils @cuc.fr...');
  const { error: delProfErr } = await supabase
    .from('profiles')
    .delete()
    .in('id', cucIds);

  if (delProfErr) {
    console.error('Erreur suppression profiles:', delProfErr.message);
  } else {
    console.log('   ✓ profiles @cuc.fr supprimés');
  }

  // D. Supprimer les comptes auth.users @cuc.fr
  console.log('Suppression des comptes auth.users @cuc.fr...');
  for (const u of cucUsers) {
    const { error: delAuthErr } = await supabase.auth.admin.deleteUser(u.id);
    if (delAuthErr) {
      console.warn(`   ✗ Erreur suppression ${u.email}:`, delAuthErr.message);
    } else {
      console.log(`   ✓ ${u.email} supprimé`);
    }
  }

  // E. Mettre à jour / garantir le rôle admin de Niels Dalery
  if (nielsAuth) {
    console.log('\nAlignement des droits admin pour niels.dalery@gmail.com...');
    await supabase.auth.admin.updateUserById(nielsAuth.id, {
      user_metadata: {
        first_name: 'Niels',
        last_name: 'Dalery',
        full_name: 'Niels Dalery',
        role: 'admin',
      },
    });

    const { error: nielsProfErr } = await supabase
      .from('profiles')
      .upsert({
        id: nielsAuth.id,
        email: 'niels.dalery@gmail.com',
        first_name: 'Niels',
        last_name: 'Dalery',
        full_name: 'Niels Dalery',
        role: 'admin',
        updated_at: new Date().toISOString(),
      });

    if (nielsProfErr) {
      console.error('Erreur profil Niels:', nielsProfErr.message);
    } else {
      console.log('   ✓ Droits admin garantis pour Niels Dalery');
    }

    // Ré-attacher la fiche formateur de Niels dans site_team
    await supabase.from('site_team').update({ profile_id: nielsAuth.id }).eq('id', 'niels-dalery');
  }

  // F. Créer ou mettre à jour Lucas Dollfus
  let lucasFinalId = lucasAuth?.id;
  if (!lucasFinalId) {
    console.log(`\nCréation du compte d'authentification pour ${lucasEmail}...`);
    const { data: newLucas, error: newLucasErr } = await supabase.auth.admin.createUser({
      email: lucasEmail,
      email_confirm: true,
      user_metadata: {
        first_name: 'Lucas',
        last_name: 'Dollfus',
        full_name: 'Lucas Dollfus',
        role: 'admin',
      },
    });

    if (newLucasErr) {
      console.error('Erreur création Lucas Auth:', newLucasErr.message);
    } else {
      lucasFinalId = newLucas.user.id;
      console.log(`   ✓ Compte Auth créé pour Lucas (${lucasFinalId})`);
    }
  } else {
    await supabase.auth.admin.updateUserById(lucasFinalId, {
      user_metadata: {
        first_name: 'Lucas',
        last_name: 'Dollfus',
        full_name: 'Lucas Dollfus',
        role: 'admin',
      },
    });
  }

  if (lucasFinalId) {
    console.log('Création / mise à jour du profil de Lucas Dollfus...');
    const { error: lucasProfErr } = await supabase
      .from('profiles')
      .upsert({
        id: lucasFinalId,
        email: lucasEmail,
        first_name: 'Lucas',
        last_name: 'Dollfus',
        full_name: 'Lucas Dollfus',
        role: 'admin',
        updated_at: new Date().toISOString(),
      });

    if (lucasProfErr) {
      console.error('Erreur profil Lucas:', lucasProfErr.message);
    } else {
      console.log('   ✓ Profil admin créé pour Lucas Dollfus');
    }

    // Lier la fiche formateur de Lucas dans site_team
    await supabase.from('site_team').update({ profile_id: lucasFinalId }).eq('id', 'lucas-dollfus');
    console.log('   ✓ Fiche formateur Lucas Dollfus reliée dans site_team');
  }

  // G. Génération des liens de réinitialisation / définition de mot de passe
  console.log('\n=== LIENS DE DÉFINITION / RÉINITIALISATION DE MOT DE PASSE ===');
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://cuc-new.vercel.app';
  const redirectTo = `${siteOrigin.replace(/\/+$/, '')}/admin/reset-password`;

  if (lucasFinalId) {
    const { data: lLink } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: lucasEmail,
      options: { redirectTo },
    });
    console.log(`\nLucas Dollfus (${lucasEmail}) :`);
    console.log(lLink?.properties?.action_link || 'Lien indisponible');
  }

  if (nielsAuth) {
    const { data: nLink } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: 'niels.dalery@gmail.com',
      options: { redirectTo },
    });
    console.log(`\nNiels Dalery (niels.dalery@gmail.com) :`);
    console.log(nLink?.properties?.action_link || 'Lien indisponible');
  }

  console.log('\n=== OPÉRATION TERMINÉE AVEC SUCCÈS ===\n');
}

run();
