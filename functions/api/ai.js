export async function onRequestPost(context) {
  try {
    const { prompt } = await context.request.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${context.env.OPENROUTER_KEY}`  // 从环境变量读取
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "AI 调用失败", detail: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
