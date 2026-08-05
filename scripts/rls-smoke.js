const { createClient } = require('@supabase/supabase-js')

async function run(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url || !anon || !service) { console.error('Missing env'); process.exit(2) }

  const anonClient = createClient(url, anon)
  const adminClient = createClient(url, service)

  console.log('Checking that anon can read public profiles...')
  const { data: profiles, error: pErr } = await anonClient.from('profiles').select('*').limit(1)
  if(pErr){ console.error('Anon read profiles failed', pErr); process.exit(3) }
  console.log('Anon read OK')

  console.log('Checking that anon cannot insert notifications...')
  const { error: notifErr } = await anonClient.from('notifications').insert([{ user_id: '00000000-0000-0000-0000-000000000000', actor_id: '00000000-0000-0000-0000-000000000000', type: 'test', data: { message: 'x' } }])
  if(!notifErr){ console.error('Anon was able to insert notifications — RLS misconfigured'); process.exit(4) }
  console.log('Anon cannot insert notifications — OK')

  console.log('Checking service role can insert notifications...')
  const { error: svcErr } = await adminClient.from('notifications').insert([{ user_id: '00000000-0000-0000-0000-000000000000', actor_id: '00000000-0000-0000-0000-000000000000', type: 'test', data: { message: 'svc' } }])
  if(svcErr){ console.error('Service role insert failed', svcErr); process.exit(5) }
  console.log('Service role insert OK')

  console.log('RLS smoke tests passed')
}

run().catch(e=>{ console.error(e); process.exit(9) })
