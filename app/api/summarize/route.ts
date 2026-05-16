import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return Response.json({ error: "请输入工作内容" }, { status: 400 });
    }

    // 开启 stream: true，返回一个异步可迭代的 Stream 对象
    // 模型每生成一小段文本（chunk），就会立即推送，而不是等全部生成完再返回
    const stream = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: [
            "你是一个专业的工作日报助手。请将用户输入的工作内容整理成一份清晰、结构化的日报。",
            "",
            "要求：",
            "1. 提取关键工作事项，用简洁的语言概括",
            "2. 按重要性或类别分组",
            "3. 输出格式如下：",
            "   - **今日工作总结**",
            "   - 列出具体事项（用 - 列表）",
            "   - **明日计划**（如果内容中提到）",
            "4. 语言专业但不生硬",
            "5. 不要添加用户没有提到的内容",
          ].join("\n"),
        },
        { role: "user", content },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      stream: true, // 启用流式输出
    });

    const encoder = new TextEncoder();

    // 将 SDK 返回的 Stream 对象包装为 Web ReadableStream
    // 前端可以用 fetch + getReader() 逐块读取
    const readable = new ReadableStream({
      async start(controller) {
        // for await...of 遍历异步迭代器，每收到一个 chunk 就立即推送给前端
        for await (const chunk of stream) {
          // delta.content 是当前 chunk 中模型新生成的文本片段
          // 不同于非流式的 message.content（完整响应），delta 是增量
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(text));
        }
        controller.close(); // 流结束，通知前端
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache", // 禁止缓存，确保每次都实时获取
      },
    });
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return Response.json(
      { error: "生成日报失败，请稍后重试" },
      { status: 500 }
    );
  }
}
