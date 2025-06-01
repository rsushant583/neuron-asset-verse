
import React, { useState, useEffect } from 'react';
import { Clock, Edit, Eye, Save, Trash2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useVersionControl } from '@/hooks/useVersionControl';

interface VersionControlProps {
  userId: string;
  onDraftSelect?: (draft: any) => void;
  onCommand?: (command: string) => void;
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

const VersionControl = ({ userId, onDraftSelect, onCommand }: VersionControlProps) => {
  const { drafts, saveDraft, deleteDraft, loading } = useVersionControl(userId);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for voice commands
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
      }
    };

    if (onCommand) {
      // This would be connected to the main voice command system
      // For now, we'll handle it through props
    }
  }, [drafts, onCommand]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDraftSelect = (draft: Draft) => {
    setSelectedDraft(draft);
    onDraftSelect?.(draft);
    speak(`Opening draft version ${draft.version} titled ${draft.title || 'Untitled'}`);
    
    toast({
      title: "Draft Loaded",
      description: `Version ${draft.version} - ${draft.title || 'Untitled'}`,
    });
  };

  const handleDeleteDraft = async (draftId: string, version: number) => {
    try {
      await deleteDraft(draftId);
      speak(`Draft version ${version} deleted`);
      toast({
        title: "Draft Deleted",
        description: `Version ${version} has been removed`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not delete the draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const readDraftAloud = (draft: Draft) => {
    const content = draft.content || 'No content available';
    const preview = content.substring(0, 200) + '...';
    speak(`Reading draft version ${draft.version}. ${preview}`);
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

  if (loading) {
    return (
      <Card className="glass-morphism border-cyber-blue/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-white text-body">Loading drafts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="version-control" className="glass-morphism border-cyber-blue/20">
      <CardHeader>
        <CardTitle className="text-white text-heading flex items-center space-x-2">
          <Clock size={24} />
          <span>Draft Versions</span>
        </CardTitle>
        <p className="text-gray-400 text-body">
          Manage your eBook drafts across multiple sessions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {drafts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-body mb-4">No drafts saved yet</div>
            <p className="text-gray-500 text-sm">
              Start creating content to see your draft versions here
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className={`version-card p-4 border rounded-lg transition-all duration-200 ${
                  selectedDraft?.id === draft.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-blue-600 text-body">
                        Version {draft.version}
                      </span>
                      {draft.title && (
                        <span className="text-gray-700 text-body">
                          - {draft.title}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-2">
                      {formatDate(draft.created_at)}
                    </div>
                    
                    {draft.chapters && draft.chapters.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-600">Chapters:</span>
                        <div className="text-sm text-gray-500">
                          {draft.chapters.join(', ')}
                        </div>
                      </div>
                    )}
                    
                    {draft.word_count && (
                      <div className="text-sm text-gray-500">
                        {draft.word_count} words
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {draft.content?.substring(0, 150)}...
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      onClick={() => handleDraftSelect(draft)}
                      className="btn-accessible bg-blue-600 hover:bg-blue-700"
                      aria-label={`Open draft version ${draft.version}`}
                    >
                      <Edit size={16} />
                    </Button>
                    
                    <Button
                      onClick={() => readDraftAloud(draft)}
                      className="btn-accessible bg-orange-500 hover:bg-orange-600"
                      aria-label={`Read draft version ${draft.version} aloud`}
                    >
                      <Volume2 size={16} />
                    </Button>
                    
                    <Button
                      onClick={() => handleDeleteDraft(draft.id, draft.version)}
                      className="btn-accessible bg-red-500 hover:bg-red-600"
                      aria-label={`Delete draft version ${draft.version}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Voice Commands:</h4>
          <ul className="text-blue-700 space-y-1 text-body">
            <li>• "Show drafts" - Display this version control panel</li>
            <li>• "Open draft version [number]" - Load a specific draft</li>
            <li>• "Save draft" - Save your current progress</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionControl;
