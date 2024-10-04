'use server'
import { log } from 'console';
import { promises as fspromises } from 'fs';
import * as fs from 'fs';


import path from 'path';
import fetch from 'node-fetch'

import { HttpsProxyAgent } from 'https-proxy-agent';
import { createClient } from '@/utils/supabase/server';


export async function getAudioFile(tts_content: string, fileName: string): Promise<string> {  
  log(tts_content,fileName)

  const url = 'https://api.goapi.ai/v1/audio/speech';
  let options = {
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
      console.log('文件存在', filePath);
      await uploadAudioFile(filePath, fileName)
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
      await fspromises.writeFile(filePath, Buffer.from(audioData), (err) => {
        if (err) {
          console.error('Error writing audio file:', err);
        } else {
          console.log('Audio file saved successfully');
        }
      });

      await uploadAudioFile(filePath, fileName)
      return `/audio/${fileName}`;
    }
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw error;
  }
}

export async function uploadAudioFile(file_path: string, fileName: string): Promise<string> { 
  const supabase = createClient();

  // upload to storage
  const { data, error } = await supabase.storage
    .from('typingdonkey')
    .upload(file_path, fileName)
  if (error) {
    // Handle error
    console.log(error)
  } else {
    // Handle success
    console.log(data)
  }
  return data?.fullPath
  // update database
  
  // const { data: sentences } = await supabase
  //   .from("sentences")
  //   .select('id,source,content,voice_url')
  //   .order('id', { ascending: true });

} 
