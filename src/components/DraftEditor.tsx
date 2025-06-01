
import React, { useState, useEffect } from 'react';
import { Sparkles, Save, RefreshCw, Volume2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { suggestTitles, analyzeContent } from '@/lib/versionControl';

interface DraftEditorProps {
  story: string;
  draft: string;
  onChange: (draft: string) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  category?: string;
}

const DraftEditor = ({ story, draft, onChange, title = '', onTitleChange, category }: DraftEditorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
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
      const draftSections = parseDraftIntoSections(draft);
      setSections(draftSections);
    }
  }, [draft]);

  const parseDraftIntoSections = (draftText: string) => {
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
      // Simulate AI draft generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const generatedSections = {
        introduction: `Introduction: Welcome to my journey of wisdom and experience. ${story.substring(0, 200)}...`,
        chapter1: `Chapter 1: The Early Years\n\nReflecting on the foundational experiences that shaped my perspective. ${story.substring(200, 500)}...`,
        chapter2: `Chapter 2: Life Lessons Learned\n\nThrough trials and triumphs, I discovered important truths that guide my actions today. ${story.substring(500, 800)}...`,
        chapter3: `Chapter 3: Wisdom for Others\n\nThe knowledge I wish to pass on to future generations, drawn from decades of experience. ${story.substring(800, 1100)}...`,
        conclusion: `Conclusion: A Legacy of Learning\n\nAs I share these experiences, I hope they inspire and guide others on their own journeys of discovery and growth.`
      };

      setSections(generatedSections);
      
      const fullDraft = Object.values(generatedSections).join('\n\n');
      onChange(fullDraft);
      
      // Auto-generate title suggestions
      if (!title) {
        await generateTitleSuggestions(fullDraft);
      }
      
      toast({
        title: "Draft Generated!",
        description: "Your AI-powered draft is ready for editing.",
      });

      speak('Your draft has been generated and is ready for editing.');
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

  const generateTitleSuggestions = async (content?: string) => {
    try {
      const textToAnalyze = content || draft || story;
      if (textToAnalyze) {
        const suggestions = await suggestTitles(textToAnalyze, category);
        setTitleSuggestions(suggestions);
        
        if (suggestions.length > 0 && !title) {
          onTitleChange?.(suggestions[0]);
          speak(`I've suggested the title: ${suggestions[0]}`);
        }
      }
    } catch (error) {
      console.error('Failed to generate title suggestions:', error);
    }
  };

  const handleSuggestTitles = () => {
    generateTitleSuggestions();
  };

  const analyzeContentStructure = async () => {
    setIsAnalyzing(true);
    try {
      const content = draft || story;
      if (content) {
        const analysis = await analyzeContent(content);
        
        if (analysis.chapters) {
          speak(`I've analyzed your content and identified ${analysis.chapters.length} main sections: ${analysis.chapters.join(', ')}`);
          
          toast({
            title: "Content Analyzed",
            description: `Identified ${analysis.chapters.length} main sections in your content.`,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze content structure.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateSection = (sectionKey: string, content: string) => {
    const updatedSections = { ...sections, [sectionKey]: content };
    setSections(updatedSections);
    
    const fullDraft = Object.values(updatedSections).join('\n\n');
    onChange(fullDraft);
  };

  const readSection = (content: string) => {
    speak(content);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
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

    speak('Draft saved successfully.');
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
              onClick={handleSuggestTitles}
              className="btn-accessible bg-purple-600 hover:bg-purple-700 flex items-center space-x-2"
              aria-label="Suggest titles"
            >
              <Lightbulb size={20} />
              <span>Suggest Title</span>
            </Button>
            <Button
              onClick={analyzeContentStructure}
              disabled={isAnalyzing}
              className="btn-accessible bg-orange-600 hover:bg-orange-700 flex items-center space-x-2"
              aria-label="Analyze content structure"
            >
              {isAnalyzing ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
              <span>Analyze</span>
            </Button>
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
        {/* Title Management Section */}
        <div className="space-y-4 p-4 bg-white/5 rounded-lg">
          <h3 className="text-white text-heading font-semibold">Title & Metadata</h3>
          
          <div className="space-y-2">
            <label htmlFor="title" className="text-white text-body font-medium">
              eBook Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange?.(e.target.value)}
              className="input-accessible"
              placeholder="Enter your eBook title..."
              aria-label="eBook title"
            />
          </div>

          {titleSuggestions.length > 0 && (
            <div className="space-y-2">
              <span className="text-white text-body font-medium">Suggested Titles:</span>
              <div className="grid gap-2">
                {titleSuggestions.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    onClick={() => onTitleChange?.(suggestion)}
                    className="btn-secondary text-left justify-start p-3 h-auto"
                    aria-label={`Use suggested title: ${suggestion}`}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {category && (
            <div className="text-sm text-gray-400">
              Category: <span className="text-white font-medium">{category}</span>
            </div>
          )}
        </div>

        {/* Content Sections */}
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
            <li>• Use "Suggest Title" to get unique, copyright-compliant title ideas</li>
            <li>• Click "Analyze" to structure your content into logical chapters</li>
            <li>• Use the speaker button to hear your text read aloud</li>
            <li>• Say "suggest title" or "save draft" for voice commands</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DraftEditor;
