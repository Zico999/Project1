// api/summarise.js
import fetch from "node-fetch";

export default async function handler(req,res){
  if(req.method !== "POST") return res.status(405).json({error:"Method Not Allowed"});

  const {text,length,style,focus} = req.body;
  if(!text || text.trim().length<10) return res.status(400).json({error:"Please provide at least 10 words."});

  const apiKey = process.env.APIKEY;
  if(!apiKey) return res.status(500).json({error:"API key not configured."});

  const lengthMap = {short:"in 1–2 sentences", medium:"in one concise paragraph", long:"in a detailed multi-paragraph summary"};
  const styleMap = {concise:"Write in a concise, direct style.", bullet:"Format as bullet points.", formal:"Write formally.", simple:"Explain in simple language (ELI5 style)."};

  const prompt = `You are an expert document summariser. Summarise the following document ${lengthMap[length]||"in one paragraph"}, focusing on ${focus||"general"}.
${styleMap[style]||""}
Do not add any preamble — just provide the summary directly.

Document:
"""
${text.trim()}
"""`;

  try{
    const response = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-api-key":apiKey,
        "anthropic-version":"2023-06-01"
      },
      body:JSON.stringify({model:"claude-haiku-4-5",max_tokens:1024,messages:[{role:"user",content:prompt}]})
    });

    const data = await response.json();
    if(!response.ok) return res.status(500).json({error:data?.error?.message||"API request failed"});

    const summary = data?.content?.[0]?.text || "No summary returned.";
    res.status(200).json({summary});

  }catch(err){
    res.status(500).json({error:err.message});
  }
}


