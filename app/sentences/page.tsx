import { createClient } from '@/utils/supabase/server';

export default async function Sentences() {
  const supabase = createClient();
  const { data: notes } = await supabase.from("sentence").select();

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}