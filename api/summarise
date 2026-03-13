export default async function handler(req,res){
try{
    const apiKey=process.env.apikey;
    if(!apiKey) return res.status(500).json({error:"Server API key not set"});
    const { text }=req.body;
    if(!text) return res.status(400).json({error:"No text provided"});

    const response=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "x-api-key":apiKey,
            "anthropic-version":"2023-06-01"
        },
        body:JSON.stringify({
            model:"claude-3-haiku-20240307",
            max_tokens:1024,
            messages:[{role:"user",content:text}]
        })
    });

    let data;
    try{data=await response.json();}catch{return res.status(500).json({error:"Failed to parse API response"});}
    if(!response.ok||!data.content||!data.content[0]?.text) return res.status(500).json({error:data.error?.message||"No summary returned from API"});

    res.status(200).json({summary:data.content[0].text});
}catch(err){
    res.status(500).json({error:err.message});
}
}