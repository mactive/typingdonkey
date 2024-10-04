"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  // 自增ID
  id: number
  // 句子来源
  source: string
  // 句子内容
  content: string
  // 句子发音
  voice_url: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "content",
    header: "Content",
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
        return <div className="text-center font-medium">no voice</div>
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      if (row.getValue("voice_url")) {
        return
      } else {
        return <Button variant="default">update audio</Button>
      }
    }
  }
]
