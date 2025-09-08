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
    const { prompt } = await req.json();

    console.log("prompt", prompt);

    if (!prompt) {
      return new Response("Missing prompt", { status: 400 });
    }

    // Create a more detailed prompt for better story generation
    const storyPrompt = `Write a creative and engaging short story based on this theme: "${prompt}". 

The story should be:
- Approximately 300-500 words
- Well-structured with a clear beginning, middle, and end
- Engaging and imaginative
- Suitable for all ages
- Written in an engaging narrative style

Theme: ${prompt}

Story:`;

    // Request a non-streaming completion
    console.log("storyPrompt", storyPrompt);
    const response = await openai.chat.completions.create({
      model: "qwen-plus",
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "You are a creative storyteller who writes engaging, imaginative short stories. Write stories that are captivating, well-structured, and suitable for all audiences.",
        },
        {
          role: "user",
          content: storyPrompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const text = response.choices?.[0]?.message?.content ?? "";
    return Response.json({ story: text });
  } catch (error) {
    console.error("Error in story generation:", error);
    return new Response("Error generating story", { status: 500 });
  }
}
