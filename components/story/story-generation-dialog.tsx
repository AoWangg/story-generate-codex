"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Globe, Loader2 } from "lucide-react";

interface StoryGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string, language: string) => Promise<void>;
  isLoading: boolean;
  isLoggedIn: boolean;
  onLogin: () => void;
}

export function StoryGenerationDialog({
  open,
  onOpenChange,
  onGenerate,
  isLoading,
  isLoggedIn,
  onLogin,
}: StoryGenerationDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<"chinese" | "english">("chinese");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Close dialog immediately when starting generation
    onOpenChange(false);
    
    await onGenerate(prompt.trim(), language);
    setPrompt("");
  };

  const languageOptions = [
    { value: "chinese", label: "中文", icon: "🇨🇳" },
    { value: "english", label: "English", icon: "🇺🇸" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Your Story
          </DialogTitle>
          <DialogDescription className="text-base">
            Enter your story plot, choose language, and let AI create an amazing story for you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="story-prompt" className="text-sm font-medium">
              Story Plot
            </Label>
            <Textarea
              id="story-prompt"
              placeholder="e.g. A penguin who dreams of flying..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Describe your desired story scene, characters or plot</span>
              <span>{prompt.length}/500</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Story Language
            </Label>
            <Select value={language} onValueChange={(value: "chinese" | "english") => setLanguage(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isLoggedIn && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-amber-600 dark:text-amber-400 text-xs">!</span>
                </div>
                <div className="text-sm">
                  <p className="text-amber-800 dark:text-amber-200 font-medium">
                    You are not logged in
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    You can still generate stories. They will be saved locally. Login to sync and keep history across devices.
                  </p>
                  <div className="mt-3">
                    <Button variant="outline" size="sm" type="button" onClick={onLogin}>
                      Login to Sync
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Story
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
