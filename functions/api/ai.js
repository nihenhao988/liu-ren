export async function onRequest(context) {
  try {
    const req = await context.request.json();
    const prompt = req.prompt;

    let data;
    const url = "https://openrouter.ai/api/v1/chat/completions";

    for (let i = 0; i < 2; i++) { // 尝试2次
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10秒超时

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${context.env.OPENROUTER_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-r1:free",
            temperature: 0.3,
            messages: [{ role: "user", content: prompt }]
          }),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) throw new Error(`HTTP状态码 ${response.status}`);

        data = await response.json();
        if (data?.choices?.[0]?.message?.content) break;

      } catch (e) {
        console.warn(`第${i + 1}次请求失败`, e);
      }
    }

    const reply = data?.choices?.[0]?.message?.content || "AI 没有返回内容，请重试";
    return new Response(JSON.stringify({ reply }), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { headers: { "Content-Type": "application/json" }, status: 500 });
  }
}
