export interface Story {
  id: string;
  theme: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  title: string;
}

export interface StoryGenerationRequest {
  theme: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  story?: string;
}