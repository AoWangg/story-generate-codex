"use client";
import { StoryGenerator } from "@/components/story/story-generator";
import {
  BookOpen,
  History,
  Menu,
  Sparkles,
  ShieldCheck,
  Clock,
  Image as ImageIcon,
  Languages,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

            {/* Desktop actions */}
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/history">
                <Button variant="outline" size="sm" className="gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </Link>
              <AuthButton />
            </div>

            {/* Mobile menu */}
            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Menu className="h-4 w-4" />
                    Menu
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-3/4 sm:max-w-sm">
                  <SheetHeader>
                    <SheetTitle className="text-left">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-3">
                    <Link href="/history">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                      >
                        <History className="h-4 w-4" />
                        History
                      </Button>
                    </Link>
                    <div>
                      <AuthButton />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Create Amazing Stories with AI
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-1">
              Enter a simple theme and watch as AI crafts a unique story just
              for you, complete with beautiful illustrations. Your stories are
              automatically saved for you to enjoy anytime.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Creative writing
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <ImageIcon className="h-3.5 w-3.5" /> AI illustrations
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Languages className="h-3.5 w-3.5" /> Multi-language
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Auto save
              </Badge>
            </div>
          </div>

          {/* Story Generator */}
          <StoryGenerator />

          {/* Features Grid */}
          <section className="pt-2">
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wand2 className="h-5 w-5 text-primary" /> One-click
                    generate
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Turn a short idea into a complete story with illustrations.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Languages className="h-5 w-5 text-primary" /> Multiple
                    languages
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Generate stories in your preferred language seamlessly.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-primary" /> Fast results
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Start reading within seconds thanks to streaming output.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Private by
                    default
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Your stories are saved to your device and your account.
                </CardContent>
              </Card>
            </div>
          </section>

          {/* How It Works */}
          <section className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-semibold tracking-tight">
                How it works
              </h3>
              <p className="text-sm text-muted-foreground">
                Three simple steps to your next story.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <Badge className="w-fit">1</Badge>
                  <CardTitle className="text-lg">Describe your theme</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Tell us what the story should be about and choose a language.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Badge className="w-fit">2</Badge>
                  <CardTitle className="text-lg">Watch it unfold</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  The story streams live while we craft matching illustrations.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Badge className="w-fit">3</Badge>
                  <CardTitle className="text-lg">Save and revisit</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Everything is auto-saved. Browse your creations in History.
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ */}
          <section className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-semibold tracking-tight">FAQ</h3>
              <p className="text-sm text-muted-foreground">
                Common questions about generating stories.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1">
                <AccordionTrigger>Is it free to use?</AccordionTrigger>
                <AccordionContent>
                  Yes. You can generate stories for free. Some features may
                  require sign-in to sync across devices.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>Where are my stories saved?</AccordionTrigger>
                <AccordionContent>
                  Stories are saved locally in your browser. If you sign in,
                  they’re also stored securely in your account.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>
                  Which languages are supported?
                </AccordionTrigger>
                <AccordionContent>
                  You can choose from multiple languages in the generator
                  dialog. We’re continuously expanding support.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <Separator />

          {/* Footer */}
          <footer className="py-6 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>AI Story Generator</span>
            </div>
            <div className="mt-2">
              <Link href="/history" className="underline underline-offset-4">
                View History
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
