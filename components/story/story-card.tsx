"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Calendar,
  Image as ImageIcon,
  Eye,
  MoreHorizontal,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Story } from "@/types/story";
import { deleteStory } from "@/lib/storage";
import { makeDownloadFilename } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface StoryCardProps {
  story: Story;
  onDelete: (storyId: string) => void;
}

export function StoryCard({ story, onDelete }: StoryCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleDownloadStory = () => {
    const filename = makeDownloadFilename(
      story.title || story.theme || "",
      "story",
      "md"
    );
    const blob = new Blob([story.content], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = async () => {
    if (!story.imageUrl) return;
    try {
      const res = await fetch(
        `/api/download-image?url=${encodeURIComponent(story.imageUrl)}`
      );
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const filename = makeDownloadFilename(
        story.title || story.theme || "",
        "story-image",
        "png"
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Failed to download image");
    }
  };

  const handleDelete = () => {
    deleteStory(story.id);
    onDelete(story.id);
    toast.success("Story deleted successfully");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPreviewText = (content: string) => {
    // Remove markdown formatting for preview
    const plainText = content
      .replace(/^#{1,6}\s+/gm, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italics
      .replace(/^>\s+/gm, "") // Remove blockquotes
      .replace(/\n\n+/g, " ") // Replace multiple newlines with space
      .replace(/\n/g, " ") // Replace single newlines with space
      .trim();

    return plainText.length > 150
      ? plainText.substring(0, 150) + "..."
      : plainText;
  };

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <CardTitle className="text-base line-clamp-2 leading-tight flex-1 min-w-0 break-words">
              {story.title}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Story
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadStory}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Story
                </DropdownMenuItem>
                {story.imageUrl && (
                  <DropdownMenuItem onClick={handleDownloadImage}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Image
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Story
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Badge variant="outline" className="text-xs w-fit">
            {story.theme}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Image Thumbnail */}
          {story.imageUrl && (
            <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
              <img
                src={story.imageUrl}
                alt={`Illustration for ${story.title}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Story Preview */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed break-words">
            {getPreviewText(story.content)}
          </p>

          <div className="flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
              <Calendar className="h-3 w-3 shrink-0" />
              <span className="truncate">{formatDate(story.createdAt)}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="text-xs shrink-0"
            >
              <Eye className="h-3 w-3 mr-1" />
              Read
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Story Detail Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-full sm:max-w-4xl max-h-[85vh] p-4 sm:p-6 overflow-x-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-xl">{story.title}</DialogTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1 min-w-0">
                  <Badge variant="outline" className="shrink-0">
                    {story.theme}
                  </Badge>
                  <span className="shrink-0">•</span>
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {formatDate(story.createdAt)}
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadStory}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Story
                </Button>
                {story.imageUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadImage}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Image
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2 pb-24 sm:pb-0">
            {/* Mobile: render plain content (no ScrollArea) */}
            <div className="sm:hidden">
              <div className="prose prose-sm max-w-none dark:prose-invert break-words">
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
                  {story.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Tablet/Desktop: keep ScrollArea for the story content */}
            <div className="hidden sm:block">
              <ScrollArea className="h-[400px]">
                <div className="prose prose-sm max-w-none dark:prose-invert break-words">
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
                    {story.content}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </div>

            {story.imageUrl && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon className="h-4 w-4" />
                  Generated Illustration
                </div>
                <div className="aspect-square w-full rounded-lg overflow-hidden">
                  <img
                    src={story.imageUrl}
                    alt={`Illustration for ${story.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          {/* <div className="sm:hidden sticky bottom-0 left-0 right-0 bg-background border-t mt-2 px-2 pt-2">
            <div className="grid gap-2">
              <Button
                onClick={handleDownloadStory}
                className="w-full"
                variant="secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Story
              </Button>
              {story.imageUrl && (
                <Button
                  onClick={handleDownloadImage}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Image
                </Button>
              )}
              <Button
                onClick={handleDelete}
                className="w-full"
                variant="destructive"
              >
                Delete
              </Button>
            </div>
          </div> */}
        </DialogContent>
      </Dialog>
    </>
  );
}
