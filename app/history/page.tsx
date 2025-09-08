"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Trash2 as Trash2All, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AuthButton } from "@/components/auth/auth-button";
import { StoryCard } from "@/components/story/story-card";
import { Story } from "@/types/story";
import {
  getStoredStories,
  deleteStory as deleteLocalStory,
} from "@/lib/storage";
import { getSupabase } from "@/lib/supabase";
import { listUserStories, deleteUserStory, clearUserStories } from "@/lib/remote-stories";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function HistoryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;

    const init = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        loadLocal();
        setIsLoggedIn(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user) {
        await loadRemote(user.id);
      } else {
        loadLocal();
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        const authed = !!session?.user;
        setIsLoggedIn(authed);
        if (authed) {
          loadRemote(session.user.id);
        } else {
          loadLocal();
        }
      });
      unsub = subscription;
    };

    init();
    return () => {
      unsub?.unsubscribe?.();
    };
  }, []);

  const loadLocal = () => {
    const storedStories = getStoredStories();
    setStories(storedStories);
    setLoading(false);
  };

  const loadRemote = async (userId: string) => {
    try {
      const supabase = getSupabase();
      if (!supabase) return loadLocal();
      setLoading(true);
      const results = await listUserStories(userId);
      setStories(results);
    } catch (e) {
      console.warn("Failed loading remote stories, falling back to local:", e);
      loadLocal();
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteStory = async (storyId: string) => {
    if (isLoggedIn) {
      try {
        await deleteUserStory(storyId);
        toast.success("Story deleted successfully");
      } catch (e) {
        toast.error("Failed to delete story from account");
      }
    } else {
      deleteLocalStory(storyId);
      toast.success("Story deleted successfully");
    }
    setStories((prev) => prev.filter((story) => story.id !== storyId));
  };

  const handleClearAllStories = async () => {
    if (isLoggedIn) {
      try {
        const supabase = getSupabase();
        if (!supabase) return;
        const { data: userInfo } = await supabase.auth.getUser();
        const userId = userInfo?.user?.id;
        if (!userId) return;
        await clearUserStories(userId);
        setStories([]);
        toast.success("All stories cleared from your account");
      } catch (e) {
        toast.error("Failed to clear stories from account");
      }
    } else {
      localStorage.removeItem("ai-stories");
      setStories([]);
      toast.success("All stories deleted successfully");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-64">
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-24 bg-muted animate-pulse rounded" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 px-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Generator
                </Button>
              </Link>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              Your Story Collection
            </h1>
            <p className="text-muted-foreground">
              {stories.length} {stories.length === 1 ? "story" : "stories"}{" "}
              saved {isLoggedIn ? "in your account" : "in your browser"}
            </p>
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:block">
            {stories.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2All className="h-4 w-4" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Stories</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete all your stories? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAllStories}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete All Stories
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Generator
                    </Button>
                  </Link>
                  {stories.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2All className="h-4 w-4" />
                          Clear All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete All Stories
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete all your stories?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleClearAllStories}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete All Stories
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <div>
                    <AuthButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No stories yet</h3>
                <p className="text-muted-foreground">
                  Generate your first story to start building your collection!
                </p>
              </div>
              <div className="mt-6">
                <Link href="/">
                  <Button className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Start Writing
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onDelete={handleDeleteStory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
