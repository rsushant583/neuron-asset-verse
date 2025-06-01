
import React, { useState, useEffect } from 'react';
import { Sparkles, Save, RefreshCw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DraftEditorProps {
  story: string;
  draft: string;
  onChange: (draft: string) => void;
}

const DraftEditor = ({ story, draft, onChange }: DraftEditorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sections, setSections] = useState({
    introduction: '',
    chapter1: '',
    chapter2: '',
    chapter3: '',
    conclusion: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (draft) {
      // Parse existing draft into sections if available
      const draftSections = parseDraftIntoSections(draft);
      setSections(draftSections);
    }
  }, [draft]);

  const parseDraftIntoSections = (draftText: string) => {
    // Simple parsing logic - in real app, this would be more sophisticated
    const lines = draftText.split('\n\n');
    return {
      introduction: lines[0] || '',
      chapter1: lines[1] || '',
      chapter2: lines[2] || '',
      chapter3: lines[3] || '',
      conclusion: lines[4] || ''
    };
  };

  const generateDraft = async () => {
    if (!story.trim()) {
      toast({
        title: "No Story Content",
        description: "Please go back and add your story first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI draft generation - in real app, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const generatedSections = {
        introduction: `Introduction: Welcome to my journey of wisdom and experience. ${story.substring(0, 200)}...`,
        chapter1: `Chapter 1: The Early Years\n\nReflecting on the foundational experiences that shaped my perspective...`,
        chapter2: `Chapter 2: Life Lessons Learned\n\nThrough trials and triumphs, I discovered important truths...`,
        chapter3: `Chapter 3: Wisdom for Others\n\nThe knowledge I wish to pass on to future generations...`,
        conclusion: `Conclusion: A Legacy of Learning\n\nAs I share these experiences, I hope they inspire and guide others...`
      };

      setSections(generatedSections);
      
      const fullDraft = Object.values(generatedSections).join('\n\n');
      onChange(fullDraft);
      
      toast({
        title: "Draft Generated!",
        description: "Your AI-powered draft is ready for editing.",
      });

      // Voice feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Your draft has been generated and is ready for editing.');
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSection = (sectionKey: string, content: string) => {
    const updatedSections = { ...sections, [sectionKey]: content };
    setSections(updatedSections);
    
    const fullDraft = Object.values(updatedSections).join('\n\n');
    onChange(fullDraft);
  };

  const readSection = (content: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const saveDraft = () => {
    const fullDraft = Object.values(sections).join('\n\n');
    onChange(fullDraft);
    
    toast({
      title: "Draft Saved",
      description: "Your changes have been saved successfully.",
    });

    // Voice feedback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Draft saved successfully.');
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const sectionTitles = {
    introduction: 'Introduction',
    chapter1: 'Chapter 1',
    chapter2: 'Chapter 2', 
    chapter3: 'Chapter 3',
    conclusion: 'Conclusion'
  };

  return (
    <Card className="glass-morphism border-cyber-blue/20">
      <CardHeader>
        <CardTitle className="text-white text-heading flex items-center justify-between">
          Edit Your Draft
          <div className="flex space-x-2">
            <Button
              onClick={generateDraft}
              disabled={isGenerating}
              className="btn-primary flex items-center space-x-2"
              aria-label="Generate AI draft"
            >
              {isGenerating ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate Draft'}</span>
            </Button>
            <Button
              onClick={saveDraft}
              className="btn-secondary flex items-center space-x-2"
              aria-label="Save draft"
            >
              <Save size={20} />
              <span>Save</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(sections).map(([key, content]) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-heading font-semibold">
                {sectionTitles[key as keyof typeof sectionTitles]}
              </h3>
              <Button
                onClick={() => readSection(content)}
                className="btn-accessible bg-orange-500 hover:bg-orange-600"
                aria-label={`Read ${sectionTitles[key as keyof typeof sectionTitles]} aloud`}
              >
                <Volume2 size={16} />
              </Button>
            </div>
            
            <Textarea
              value={content}
              onChange={(e) => updateSection(key, e.target.value)}
              className="input-accessible min-h-[150px] text-body"
              placeholder={`Write your ${sectionTitles[key as keyof typeof sectionTitles].toLowerCase()}...`}
              aria-label={`Edit ${sectionTitles[key as keyof typeof sectionTitles]}`}
            />
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">AI Writing Tips:</h4>
          <ul className="text-blue-700 space-y-1 text-body">
            <li>• Click "Generate Draft" to create AI-powered content from your story</li>
            <li>• Edit each section to add your personal touch</li>
            <li>• Use the speaker button to hear your text read aloud</li>
            <li>• Save frequently to preserve your changes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DraftEditor;
