export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt, story } = await req.json();

    if (!prompt) {
      return Response.json({ error: "Missing prompt" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const imagePrompt = `为故事创作一幅精美的艺术插画，主题：${prompt}。图像应该：
    - 视觉效果吸引人且适合全家观看
    - 采用故事书插画风格
    - 色彩丰富且引人入胜
    - 适合所有年龄段
    - 高质量且细节丰富`;

    const resp = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "X-DashScope-Async": "enable",
        },
        body: JSON.stringify({
          model: "qwen-image",
          input: { prompt: imagePrompt },
          parameters: {
            size: "1328*1328",
            n: 1,
            prompt_extend: true,
            watermark: true,
          },
        }),
      }
    );

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`DashScope create failed: ${resp.status} ${text}`);
    }

    const data = await resp.json();
    const taskId = data?.output?.task_id as string | undefined;
    const taskStatus = data?.output?.task_status as string | undefined;
    if (!taskId) {
      throw new Error("No task_id returned from DashScope");
    }

    return Response.json({ taskId, taskStatus: taskStatus || "PENDING" });
  } catch (error) {
    console.error("Error creating image task:", error);
    return Response.json(
      { error: "Failed to create image task" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("task_id");
    if (!taskId) {
      return Response.json({ error: "Missing task_id" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const resp = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`DashScope status failed: ${resp.status} ${text}`);
    }

    const data = await resp.json();
    const status = data?.output?.task_status as
      | "PENDING"
      | "RUNNING"
      | "SUCCEEDED"
      | "FAILED"
      | "CANCELED"
      | string;

    let imageUrl: string | undefined;
    if (status === "SUCCEEDED") {
      const results = data?.output?.results;
      if (Array.isArray(results) && results.length > 0) {
        imageUrl = results[0]?.url as string | undefined;
      }
    }

    return Response.json({ status, imageUrl });
  } catch (error) {
    console.error("Error polling image task:", error);
    return Response.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}
