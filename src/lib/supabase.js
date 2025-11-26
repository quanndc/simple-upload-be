const { createClient } = require('@supabase/supabase-js');

let client;

function getSupabaseClient() {
  if (client) {
    return client;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return client;
}

module.exports = {
  getSupabaseClient,
};

