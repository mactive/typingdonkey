'use server'
import { log } from 'console';
import { promises as fs } from 'fs';

import path from 'path';
import fetch from 'node-fetch'

import { HttpsProxyAgent } from 'https-proxy-agent';


export async function saveAudioFile(tts_content: string, fileName: string): Promise<string> {
  const proxy = {
    host: process.env.PROXY_HOST,
    port: process.env.PROXY_PORT
  }
  log(proxy,tts_content,fileName)
  const proxyAgent = new HttpsProxyAgent(`http://${proxy.host}:${proxy.port}`);

  const url = 'https://api.goapi.ai/v1/audio/speech';
  const options = {
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
    agent: proxyAgent,
  };
  

  try {
    const response = await fetch(url, options);
    console.log(response)
    const audioData = await response.arrayBuffer();
    // 处理获取到的音频数据
    console.log('Audio data fetched successfully');
    console.log(audioData)
    // ...

    // 将音频数据写入文件
    const filePath = path.join(process.cwd(), 'public', 'audio', fileName);
    await fs.writeFile(filePath, Buffer.from(audioData), (err) => {
      if (err) {
        console.error('Error writing audio file:', err);
      } else {
        console.log('Audio file saved successfully');
      }
    });

    return `/audio/${fileName}`;
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw error;
  }
}