import { createClient } from '@/utils/supabase/server';
import { Payment, columns } from "./columns"
import { DataTable } from "./data-table"

export default async function Sentences() {
  const supabase = createClient();
  const { data: sentences } = await supabase
    .from("sentences_100")
    .select('id,tags,en_content,voice_url')
    .order('id', { ascending: true });

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={sentences!}/>
    </div>
  )
//   return <pre>{JSON.stringify(sentences, null, 2)}</pre>
}
