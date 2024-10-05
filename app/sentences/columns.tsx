"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getAudioFile } from '@/utils/goapi/tts'


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  // 自增ID
  id: number
  // 句子来源
  tags: string
  // 句子内容
  en_content: string
  // 句子发音
  voice_url: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "tags",
    header: "tags",
  },
  {
    accessorKey: "en_content",
    header: "en_content",
  },
  {
    accessorKey: "voice_url",
    header: "Voice_url",
    cell: ({ row }) => {
      if(row.getValue("voice_url")) {
        return (
          <Popover>
            <PopoverTrigger><a href={row.getValue("voice_url")}>Voice.mp3 &#9658;</a></PopoverTrigger>
            <PopoverContent>Place content for the popover here.</PopoverContent>
          </Popover>
        )
      } else {
        return <div className="text-center font-medium">
          <Button variant="secondary" onClick={async ()=>{
            await getAudioFile(row.getValue("en_content"), row.getValue("id"));
            console.log("===done==")
            location.reload();
          }}>download</Button>
        </div>
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <div className="text-center font-medium">
        <Button variant="link" onClick={async ()=>{
          await getAudioFile(row.getValue("en_content"), row.getValue("id"));
          console.log("===done==")
          location.reload();
        }}>redownload</Button>
      </div>
    }
  }
]
