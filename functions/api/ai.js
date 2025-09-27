export async function onRequest(context){
  try{
    const req=await context.request.json();
    const prompt=req.prompt;

    let data;
    for(let i=0;i<2;i++){ // 尝试2次
      try{
        const response=await fetch("https://openrouter.ai/api/v1/chat/completions",{
          method:"POST",
          headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${context.env.OPENROUTER_KEY}`
          },
          body:JSON.stringify({
            model:"deepseek/deepseek-r1:free",
            temperature:0.3,
            messages:[{role:"user",content:prompt}]
          })
        });
        data=await response.json();
        if(data.choices?.[0]?.message?.content) break;
      }catch(e){
        console.warn("OpenRouter请求失败，重试",e);
      }
    }

    const reply=data?.choices?.[0]?.message?.content||"AI 没有返回内容，请重试";
    return new Response(JSON.stringify({reply}),{headers:{"Content-Type":"application/json"}});
  }catch(err){
    return new Response(JSON.stringify({error:err.message}),{headers:{"Content-Type":"application/json"},status:500});
  }
}
