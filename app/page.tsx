import { StoryGenerator } from "@/components/story/story-generator";
import { BookOpen, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">AI Story Generator</h1>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/history">
                <Button variant="outline" size="sm" className="gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </Link>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Create Amazing Stories with AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enter a simple theme and watch as AI crafts a unique story just
              for you, complete with beautiful illustrations. Your stories are
              automatically saved for you to enjoy anytime.
            </p>
          </div>

          {/* Story Generator */}
          <StoryGenerator />
        </div>
      </main>
    </div>
  );
}
