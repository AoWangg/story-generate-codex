import { Story } from '@/types/story';

const STORIES_KEY = 'ai-stories';

export const getStoredStories = (): Story[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading stories from localStorage:', error);
    return [];
  }
};

export const saveStory = (story: Story): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const stories = getStoredStories();
    const updatedStories = [story, ...stories];
    localStorage.setItem(STORIES_KEY, JSON.stringify(updatedStories));
  } catch (error) {
    console.error('Error saving story to localStorage:', error);
  }
};

export const deleteStory = (storyId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const stories = getStoredStories();
    const filteredStories = stories.filter(story => story.id !== storyId);
    localStorage.setItem(STORIES_KEY, JSON.stringify(filteredStories));
  } catch (error) {
    console.error('Error deleting story from localStorage:', error);
  }
};

export const updateStory = (updatedStory: Story): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const stories = getStoredStories();
    const updatedStories = stories.map(story => 
      story.id === updatedStory.id ? updatedStory : story
    );
    localStorage.setItem(STORIES_KEY, JSON.stringify(updatedStories));
  } catch (error) {
    console.error('Error updating story in localStorage:', error);
  }
};