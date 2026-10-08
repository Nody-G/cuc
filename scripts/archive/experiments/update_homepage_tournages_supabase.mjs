import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function updateHomepage() {
  console.log('Fetching site_pages where slug = "/"...');
  const { data, error } = await supabase
    .from('site_pages')
    .select('*')
    .eq('slug', '/')
    .maybeSingle();

  if (error) {
    console.error('Error fetching page:', error);
    return;
  }

  if (!data) {
    console.log('No row found for slug = "/" in site_pages');
    return;
  }

  console.log('Current layout_sections:', JSON.stringify(data.layout_sections, null, 2));

  // Replace virtual_tour with tournages
  const updatedLayoutSections = (data.layout_sections || []).map((sec) => {
    if (sec.id === 'virtual_tour') {
      return {
        id: 'tournages',
        name: 'Tournages & Productions Cinéma',
        order: sec.order ?? 3,
        is_visible: sec.is_visible ?? true,
      };
    }
    return sec;
  });

  // Ensure tournages exists if it wasn't there
  const hasTournages = updatedLayoutSections.some((s) => s.id === 'tournages');
  if (!hasTournages) {
    updatedLayoutSections.splice(2, 0, {
      id: 'tournages',
      name: 'Tournages & Productions Cinéma',
      order: 3,
      is_visible: true,
    });
  }

  // Also check sections_data
  const sectionsData = data.sections_data || {};
  if (!sectionsData.tournages) {
    sectionsData.tournages = {
      badge: 'ACTION DESIGN & COORDINATION DE CASCADES',
      title: 'TOURNAGES & PRODUCTIONS CINÉMA',
      subtitle: 'De la prévisualisation 3D aux tournages internationaux : le CUC accompagne les plus grands réalisateurs et plateformes mondiales.',
      cta_text: 'Échanger sur votre production',
      cta_link: '/contact-cuc',
    };
  }

  console.log('Updating site_pages for slug = "/"...');
  const { error: updateError } = await supabase
    .from('site_pages')
    .update({
      layout_sections: updatedLayoutSections,
      sections_data: sectionsData,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', '/');

  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Successfully updated site_pages for slug = "/" in Supabase!');
  }
}

updateHomepage();
