import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv'; // trocado para compatibilidade
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

    // criar auth user com a service role
    const res = await sb.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (res.error) throw res.error;

    // alguns retornos colocam o user em res.data.user ou em res.data diretamente
    const authUser = (res.data as any)?.user ?? (res.data as any);
    const authUid = authUser?.id;
    if (!authUid) throw new Error('Criado sem id de usuário (auth).');

    // insert ou upsert no perfil — onConflict como string 'id'
    const { error: insertErr } = await sb
      .from('profiles')
      .upsert({
        id: authUid,
        email: adminEmail,
        full_name: 'Admin',
        is_admin: true
      }, { onConflict: 'id' });

    if (insertErr) throw insertErr;

    console.log('Admin seeded:', adminEmail, 'id:', authUid);
    process.exit(0);
  } catch (e: any) {
    console.error('Erro ao seedar admin:', e.message ?? e);
    process.exit(1);
  }
}

run();