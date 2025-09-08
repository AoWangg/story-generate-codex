"use client";

import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Image as ImageIcon,
  Save,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Story } from "@/types/story";
import { saveStory } from "@/lib/storage";
import { getSupabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";
import { StoryGenerationDialog } from "./story-generation-dialog";

export function StoryGenerator() {
  const [theme, setTheme] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Check login status
  useEffect(() => {
    checkLoginStatus();
    
    // Listen for auth state changes
    const supabase = getSupabase();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setIsLoggedIn(!!session?.user);
        if (event === 'SIGNED_IN') {
          checkLoginStatus(); // Refresh login status
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const checkLoginStatus = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
    }
  };

  const handleLogin = async () => {
    // This will trigger the auth modal - you might need to import and use your auth modal component
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed, please try again");
    }
  };

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

  const onSubmit = async (prompt: string, language: string) => {
    if (!prompt.trim() || isLoading) return;

    setTheme(prompt);
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
        body: JSON.stringify({ prompt, language }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error("Failed to generate story");
      }

      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullStoryText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.story) {
                  fullStoryText += data.story;
                  setCompletion(fullStoryText);
                }
              } catch (e) {
                // Skip malformed JSON
              }
            }
          }
        }
      }

      if (fullStoryText) {
        const title = fullStoryText.split("\n")[0]?.substring(0, 50) || prompt;
        const story: Story = {
          id: uuidv4(),
          theme: prompt,
          content: fullStoryText,
          title: title,
          createdAt: new Date().toISOString(),
        };
        setCurrentStory(story);
        await generateImage(prompt, fullStoryText, story);
      }
    } catch (err) {
      if ((err as any)?.name !== "AbortError") {
        console.error("Error generating story:", err);
        toast.error("Failed to generate story, please try again");
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
      {/* Story Generation Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Story Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Let AI create amazing stories for you. Enter your ideas, choose
              language, and start your creative journey!
            </p>
            <Button
              size="lg"
              onClick={() => setDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Creating Story
            </Button>
          </div>
        </CardContent>
      </Card>

      <StoryGenerationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onGenerate={onSubmit}
        isLoading={isLoading}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
      />

      {/* Story Output */}
      {(completion || isLoading) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Text Content */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Generated Story</CardTitle>
                <div className="flex items-center gap-2">
                  {isLoading && (
                    <Button size="sm" variant="outline" onClick={handleStop}>
                      Stop Generation
                    </Button>
                  )}
                  {theme && (
                    <Badge variant="secondary" className="text-xs">
                      Theme: {theme}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {completion ? (
                    <div className="leading-relaxed text-foreground">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-bold mb-4 mt-6">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-semibold mb-3 mt-6">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-semibold mb-2 mt-4">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-4 leading-relaxed">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-4">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {completion}
                      </ReactMarkdown>
                    </div>
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
                    Story automatically saved
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
