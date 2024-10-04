'use server'
import { log } from 'console';
import { promises as fspromises } from 'fs';
import * as fs from 'fs';


import path from 'path';
import fetch, { RequestInit } from 'node-fetch'

import { HttpsProxyAgent } from 'https-proxy-agent';
import { createClient } from '@/utils/supabase/server';



export async function getAudioFile(tts_content: string, fileId: number): Promise<string> {  
  const fileName = "sentence_"+fileId.toString()+".mp3"
  log(tts_content,fileName)

  const url = 'https://api.goapi.ai/v1/audio/speech';
  let options: RequestInit = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 357d9d6f40262236c62135a3bccd3dd4e61ce1c83791b4128473498bec84d371',
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    },
    body: JSON.stringify({
      "model": "tts-1",
      "input": tts_content,
      "voice": "alloy",
      "response_format": "mp3"
    }),
  };

  // npm run dev than set local proxy
  if (process.env.NODE_ENV == 'development'){
    const proxy = {
      host: process.env.PROXY_HOST,
      port: process.env.PROXY_PORT
    }
    const proxyAgent = new HttpsProxyAgent(`http://${proxy.host}:${proxy.port}`);
    options.agent = proxyAgent
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'audio', fileName);

    if (fs.existsSync(filePath)) {
      console.log('文件存在', filePath, fileName);
      await uploadAudioFile(filePath, fileName, fileId)
      return `/audio/${fileName}`;
    } else {
      console.log('文件不存在');
      const response = await fetch(url, options);
      const audioData = await response.arrayBuffer();
      // 处理获取到的音频数据
      console.log('Audio data fetched successfully');
      console.log(audioData)
      // ...

      // 将音频数据写入文件
      try {
        await fspromises.writeFile(filePath, Buffer.from(audioData).toString());
        console.log('Audio file saved successfully');
      } catch (err) {
        // 处理文件写入错误
        console.error('Error writing audio file:', err);
      }
      // await fspromises.writeFile(filePath, Buffer.from(audioData).toString(), (err: any) => {
      //   if (err) {
      //     console.error('Error writing audio file:', err);
      //   } else {
      //     console.log('Audio file saved successfully');
      //   }
      // });

      await uploadAudioFile(filePath, fileName, fileId)
      return `/audio/${fileName}`;
    }
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw error;
  }
}

export async function uploadAudioFile(filePath: string, fileName: string, fileId: number): Promise<string> { 
  const supabase = createClient();

  // upload to storage
  console.log('上传文件', fileName, filePath);
  const Buffer = fs.readFileSync(filePath);
  const { data: SData, error } :{data: StorageData | null, error: Error | null } = await supabase.storage
    .from('typingdonkey')
    .upload("sentences/"+fileName, Buffer, {
      contentType: 'audio/mpeg',
      cacheControl: '3600',
      upsert: true,
    })
  if (error) {
    // Handle error
    console.log(error)
  } else {
    // Handle success
    console.log(SData)
  }

  // update database
  // TODO 拼接完整的url ,改成 id
  if(SData && SData?.id && SData.fullPath) {
    const voiceUrl = "https://ievuvdhmmcfrgzbhbrvw.supabase.co/storage/v1/object/public/"+SData?.fullPath
    
    console.log(voiceUrl, SData, fileId)
    const { data: sentences, error } = await supabase
      .from("sentences")
      .update({ 'voice_url': voiceUrl, 'bucket_id': SData?.id })
      .eq('id', fileId)
    
      if (error) {
        // Handle error
        console.log('update error',error)
      } else {
        // Handle success
        console.log('update success',sentences)
      }
    
  } else {
    console.log("SData 结构不合法")
  }
  
  return 'success'
} 

type StorageData = {
  path: string      //'sentence_2.mp3',
  id: string        // '9f366e19-0dc0-4138-bbd5-eb657480fc3c',
  fullPath: string  // 'typingdonkey/sentence_2.mp3'
}