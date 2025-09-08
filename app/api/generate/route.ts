import { OpenAI } from "openai";

// Create an OpenAI API client (that's edge runtime compatible)
const openai = new OpenAI({
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

// Set the runtime to edge for better performance
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt, language = "chinese" } = await req.json();

    console.log("prompt", prompt, "language", language);

    if (!prompt) {
      return new Response("Missing prompt", { status: 400 });
    }

    // Create language-specific prompts
    const isEnglish = language === "english";
    const languageInstruction = isEnglish 
      ? "Write the story in English." 
      : "请用中文写故事。";

    const storyPrompt = `${languageInstruction} Write a creative and engaging short story based on this theme: "${prompt}". 

The story should be:
- Approximately 300-500 words
- Well-structured with a clear beginning, middle, and end
- Engaging and imaginative
- Suitable for all ages
- Written in an engaging narrative style
- Formatted in markdown with proper headings, paragraphs, and styling

Please format the story using markdown syntax:
- Use # for the story title
- Use ## for chapter/section headings if applicable
- Use proper paragraph breaks
- Use *italics* and **bold** for emphasis where appropriate
- Use > for quotes if needed

Theme: ${prompt}

Story:`;

    // Request a streaming completion
    console.log("storyPrompt", storyPrompt);
    const response = await openai.chat.completions.create({
      model: "qwen-plus",
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are a creative storyteller who writes engaging, imaginative short stories. Write stories that are captivating, well-structured, and suitable for all audiences. Always format your stories using proper markdown syntax. When asked to write in Chinese, write completely in Chinese. When asked to write in English, write completely in English.",
        },
        {
          role: "user",
          content: storyPrompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    // Create a ReadableStream to handle streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              // Send each chunk as JSON with story field
              const data = JSON.stringify({ story: content });
              controller.enqueue(`data: ${data}\n\n`);
            }
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error in story generation:", error);
    return new Response("Error generating story", { status: 500 });
  }
}
