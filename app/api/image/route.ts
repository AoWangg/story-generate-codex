export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt, story } = await req.json();

    if (!prompt) {
      return Response.json({ error: "Missing prompt" }, { status: 400 });
    }

    // 为故事主题创建更好的中文提示词
    const imagePrompt = `为故事创作一幅精美的艺术插画，主题：${prompt}。图像应该：
    - 视觉效果吸引人且适合全家观看
    - 采用故事书插画风格
    - 色彩丰富且引人入胜
    - 适合所有年龄段
    - 高质量且细节丰富`;

    const response = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen-image",
          input: {
            messages: [
              {
                role: "user",
                content: [
                  {
                    text: imagePrompt,
                  },
                ],
              },
            ],
          },
          parameters: {
            size: "1328*1328",
            n: 1,
            prompt_extend: true,
            watermark: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Parse provider response: output.choices[0].message.content[0].image
    let imageUrl: string | null = null;
    const choices = data?.output?.choices;
    if (Array.isArray(choices) && choices.length > 0) {
      const content = choices?.[0]?.message?.content;
      if (Array.isArray(content)) {
        const imgPart = content.find(
          (p: any) => p && typeof p === 'object' && typeof p.image === 'string'
        );
        if (imgPart) imageUrl = imgPart.image as string;
      }
    }

    if (!imageUrl) {
      throw new Error("No image URL received from Qwen");
    }

    return Response.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return Response.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
