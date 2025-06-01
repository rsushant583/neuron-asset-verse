
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveDraft, getDrafts, deleteDraft } from '@/lib/versionControl';

interface Draft {
  id: string;
  version: number;
  content: string;
  title?: string;
  created_at: string;
  chapters?: string[];
  word_count?: number;
}

export const useVersionControl = (userId: string) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadDrafts();
    }
  }, [userId]);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const userDrafts = await getDrafts(userId);
      setDrafts(userDrafts.sort((a, b) => b.version - a.version)); // Latest first
    } catch (error) {
      console.error('Failed to load drafts:', error);
      toast({
        title: "Failed to Load Drafts",
        description: "Could not retrieve your saved drafts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNewDraft = async (content: string, title?: string, chapters?: string[]) => {
    try {
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      const draft = await saveDraft(userId, {
        content,
        title,
        chapters,
        word_count: wordCount
      });
      
      setDrafts(prevDrafts => [draft, ...prevDrafts]);
      
      toast({
        title: "Draft Saved",
        description: `Version ${draft.version} saved successfully.`,
      });

      return draft;
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast({
        title: "Save Failed",
        description: "Could not save your draft. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeDeleteDraft = async (draftId: string) => {
    try {
      await deleteDraft(draftId);
      setDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== draftId));
    } catch (error) {
      console.error('Failed to delete draft:', error);
      throw error;
    }
  };

  const getCurrentVersion = () => {
    return drafts.length > 0 ? Math.max(...drafts.map(d => d.version)) + 1 : 1;
  };

  const getDraftByVersion = (version: number) => {
    return drafts.find(draft => draft.version === version);
  };

  return {
    drafts,
    loading,
    saveDraft: saveNewDraft,
    deleteDraft: removeDeleteDraft,
    loadDrafts,
    getCurrentVersion,
    getDraftByVersion
  };
};

export default useVersionControl;
