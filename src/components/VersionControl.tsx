
import React, { useState, useEffect } from 'react';
import { Clock, Edit, Eye, Save, Trash2, Volume2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useVersionControl } from '@/hooks/useVersionControl';
import { motion, AnimatePresence } from 'framer-motion';

interface VersionControlProps {
  userId: string;
  onDraftSelect?: (draft: any) => void;
  onCommand?: (command: string) => void;
  className?: string;
}

interface Draft {
  id: string;
  version: number;
  content: string;
  title?: string;
  created_at: string;
  chapters?: string[];
  word_count?: number;
}

const VersionControl = ({ userId, onDraftSelect, onCommand, className }: VersionControlProps) => {
  const { drafts, saveDraft, deleteDraft, loading, loadDrafts } = useVersionControl(userId);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Voice command handler
    const handleVoiceCommand = (command: string) => {
      if (command === 'show_drafts') {
        document.getElementById('version-control')?.scrollIntoView({ behavior: 'smooth' });
        speak('Showing your draft versions');
      } else if (command.startsWith('open_draft_')) {
        const version = parseInt(command.split('_')[2]);
        const draft = drafts.find(d => d.version === version);
        if (draft) {
          handleDraftSelect(draft);
        } else {
          speak(`Draft version ${version} not found`);
        }
      } else if (command === 'refresh_drafts') {
        handleRefreshDrafts();
      }
    };

    if (onCommand && drafts.length > 0) {
      // This would be connected to the main voice command system
      console.log('Version control ready for voice commands');
    }
  }, [drafts, onCommand]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDraftSelect = (draft: Draft) => {
    setSelectedDraft(draft);
    onDraftSelect?.(draft);
    speak(`Opening draft version ${draft.version} titled ${draft.title || 'Untitled'}`);
    
    toast({
      title: "Draft Loaded",
      description: `Version ${draft.version} - ${draft.title || 'Untitled'} (${draft.word_count || 0} words)`,
    });
  };

  const handleDeleteDraft = async (draftId: string, version: number) => {
    try {
      await deleteDraft(draftId);
      speak(`Draft version ${version} deleted successfully`);
      toast({
        title: "Draft Deleted",
        description: `Version ${version} has been removed`,
      });
    } catch (error) {
      speak('Error deleting draft. Please try again.');
      toast({
        title: "Delete Failed",
        description: "Could not delete the draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshDrafts = async () => {
    setIsRefreshing(true);
    try {
      await loadDrafts();
      speak('Draft list refreshed');
      toast({
        title: "Drafts Refreshed",
        description: "Your draft list has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh drafts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const readDraftAloud = (draft: Draft) => {
    const content = draft.content || 'No content available';
    const preview = content.substring(0, 300);
    const readableText = `Reading draft version ${draft.version}. ${draft.title ? `Title: ${draft.title}.` : ''} ${preview}${content.length > 300 ? '... and more content continues.' : ''}`;
    speak(readableText);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWordCount = (content: string) => {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (loading) {
    return (
      <Card className={`glass-morphism border-cyber-blue/20 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-white text-body">Loading your drafts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="version-control" className={`glass-morphism border-cyber-blue/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-heading flex items-center space-x-2">
            <Clock size={24} />
            <span>Draft Versions</span>
            <span className="text-sm font-normal text-gray-400">({drafts.length})</span>
          </CardTitle>
          
          <Button
            onClick={handleRefreshDrafts}
            disabled={isRefreshing}
            className="btn-accessible bg-blue-600 hover:bg-blue-700"
            aria-label="Refresh draft list"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
        </div>
        
        <p className="text-gray-400 text-body">
          Manage your eBook drafts across multiple sessions. Say "show drafts" or "open draft [number]"
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {drafts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="text-gray-400 text-body mb-4">No drafts saved yet</div>
            <p className="text-gray-500 text-sm">
              Start creating content to see your draft versions here. 
              Use voice commands like "save draft" to create your first version.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {drafts.map((draft, index) => (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className={`draft-card p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                    selectedDraft?.id === draft.id 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => handleDraftSelect(draft)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold text-blue-600 text-body">
                          Version {draft.version}
                        </span>
                        {draft.title && (
                          <span className="text-gray-700 text-body font-medium">
                            {draft.title}
                          </span>
                        )}
                        {selectedDraft?.id === draft.id && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-2 flex items-center space-x-4">
                        <span>{formatDate(draft.created_at)}</span>
                        {draft.word_count && (
                          <span className="flex items-center space-x-1">
                            <Edit size={12} />
                            <span>{draft.word_count} words</span>
                          </span>
                        )}
                      </div>
                      
                      {draft.chapters && draft.chapters.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">Chapters:</span>
                          <div className="text-sm text-gray-500 mt-1">
                            {draft.chapters.slice(0, 3).join(', ')}
                            {draft.chapters.length > 3 && ` +${draft.chapters.length - 3} more`}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {draft.content?.substring(0, 120)}
                        {draft.content && draft.content.length > 120 && '...'}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDraftSelect(draft);
                        }}
                        className="btn-accessible bg-blue-600 hover:bg-blue-700 text-white"
                        aria-label={`Open draft version ${draft.version}`}
                        size="sm"
                      >
                        <Edit size={14} />
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          readDraftAloud(draft);
                        }}
                        className="btn-accessible bg-orange-500 hover:bg-orange-600 text-white"
                        aria-label={`Read draft version ${draft.version} aloud`}
                        size="sm"
                      >
                        <Volume2 size={14} />
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete draft version ${draft.version}?`)) {
                            handleDeleteDraft(draft.id, draft.version);
                          }
                        }}
                        className="btn-accessible bg-red-500 hover:bg-red-600 text-white"
                        aria-label={`Delete draft version ${draft.version}`}
                        size="sm"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Voice commands help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6"
        >
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
            <Volume2 size={16} />
            <span>Voice Commands:</span>
          </h4>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• "Show drafts" - Display this version control panel</li>
            <li>• "Open draft version [number]" - Load a specific draft (e.g., "open draft version 2")</li>
            <li>• "Save draft" - Save your current progress as a new version</li>
            <li>• "Refresh drafts" - Update the draft list</li>
          </ul>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default VersionControl;
