"use client";

import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Story } from "@/types/story";
import { saveStory } from "@/lib/storage";
import { getSupabase } from "@/lib/supabase";

export function StoryGenerator() {
  const [theme, setTheme] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [input, setInput] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generateImage = async (
    prompt: string,
    storyContent: string,
    story: Story
  ) => {
    setIsGeneratingImage(true);
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `A beautiful illustration for a story about: ${prompt}`,
          story: storyContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const data = await response.json();

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);

        // Update story with image and save locally
        const updatedStory = { ...story, imageUrl: data.imageUrl };
        setCurrentStory(updatedStory);
        saveStory(updatedStory);
        // Persist to Supabase if logged in
        persistToSupabase(updatedStory, storyContent);

        toast.success("Story and image generated successfully!");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      // Save story without image
      saveStory(story);
      // Persist to Supabase if logged in
      persistToSupabase(story, storyContent);
      toast.success(
        "Story generated! Image generation failed, but story was saved."
      );
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const persistToSupabase = async (story: Story, fullText: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Create a conversation per generation
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title: story.title })
        .select("id")
        .single();
      if (convErr || !conv) return;

      const conversationId = conv.id;

      // Insert user prompt and assistant story as two messages
      const messages = [
        {
          conversation_id: conversationId,
          user_id: user.id,
          role: "user" as const,
          content: story.theme,
        },
        {
          conversation_id: conversationId,
          user_id: user.id,
          role: "assistant" as const,
          content: fullText,
        },
      ];
      await supabase.from("messages").insert(messages);
    } catch (e) {
      console.warn("Persist to Supabase failed:", e);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setTheme(input);
    setGeneratedImage(null);
    setCurrentStory(null);
    setCompletion("");

    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error("Failed to generate story");
      }

      const data = await res.json();
      const storyText: string = data?.story || data?.completion || "";
      setCompletion(storyText);

      if (storyText) {
        const title = storyText.split("\n")[0]?.substring(0, 50) || input;
        const story: Story = {
          id: uuidv4(),
          theme: input,
          content: storyText,
          title: title,
          createdAt: new Date().toISOString(),
        };
        setCurrentStory(story);
        await generateImage(input, storyText, story);
      }
    } catch (err) {
      if ((err as any)?.name !== "AbortError") {
        console.error("Error generating story:", err);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    if (completion && theme) {
      const title = completion.split("\n")[0]?.substring(0, 50) || theme;
      const story: Story = {
        id: uuidv4(),
        theme: theme,
        content: completion,
        title: title,
        createdAt: new Date().toISOString(),
      };

      setCurrentStory(story);
      generateImage(theme, completion, story);
    }
  };

  return (
    <div className="space-y-6">
      {/* Story Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Your Story
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your story theme (e.g., 'a penguin who dreams of flying')"
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="default"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
              {isLoading && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStop}
                  size="default"
                >
                  Stop
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Story Output */}
      {(completion || isLoading) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Text Content */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Generated Story</CardTitle>
                {theme && (
                  <Badge variant="secondary" className="text-xs">
                    Theme: {theme}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                <div className="prose prose-sm max-w-none">
                  {completion ? (
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                      {completion}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  )}
                </div>
              </ScrollArea>
              {currentStory && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Save className="h-4 w-4" />
                    Story automatically saved to your browser
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Image */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5" />
                Generated Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt={`Illustration for: ${theme}`}
                    className="w-full h-full object-cover"
                  />
                ) : isGeneratingImage ? (
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Generating your story illustration...
                    </p>
                  </div>
                ) : completion && !isLoading ? (
                  <div className="text-center space-y-2">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Image generation starting...
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Your story image will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
