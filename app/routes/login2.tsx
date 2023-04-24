import { json } from '@remix-run/node' // change this import to whatever runtime you are using
import { createServerClient } from '@supabase/auth-helpers-remix'

import type { LoaderArgs } from '@remix-run/node' // change this import to whatever runtime you are using

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response()
  const supabaseClient = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )

  const { data } = await supabaseClient.from('test').select('*')

  return json(
    { data },
    {
      headers: response.headers,
    }
  )
}