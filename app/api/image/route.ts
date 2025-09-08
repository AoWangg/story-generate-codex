import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { prompt, story } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Create a better prompt for DALL-E
    const imagePrompt = `Create a beautiful, artistic illustration for a story with this theme: ${prompt}. The image should be:
    - Visually appealing and family-friendly
    - In a storybook illustration style
    - Colorful and engaging
    - Suitable for all ages
    - High quality and detailed`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    });

    const imageUrl = response.data?.[0]?.url ?? null;

    if (!imageUrl) {
      throw new Error('No image URL received from OpenAI');
    }

    return Response.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    return Response.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
