
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import VoiceInput from './VoiceInput';
import DraftEditor from './DraftEditor';
import TemplateSelector from './TemplateSelector';
import PublishForm from './PublishForm';
import VersionControl from './VersionControl';
import VoiceAssistant from './VoiceAssistant';
import { useVersionControl } from '@/hooks/useVersionControl';
import { useToast } from '@/hooks/use-toast';
import { suggestTitles, checkTitle } from '@/lib/versionControl';

interface CreatorWizardProps {
  onComplete?: (productData: any) => void;
  onClose?: () => void;
}

const CreatorWizard = ({ onComplete, onClose }: CreatorWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [storyText, setStoryText] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [publishData, setPublishData] = useState({});
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  
  const userId = 'user123'; // This would come from auth context
  const { saveDraft } = useVersionControl(userId);
  const { toast } = useToast();

  const steps = [
    { id: 1, title: 'Tell Your Story', description: 'Share your life experiences and wisdom' },
    { id: 2, title: 'Edit Your Draft', description: 'Review and refine the AI-generated content' },
    { id: 3, title: 'Choose Template', description: 'Select a beautiful design for your product' },
    { id: 4, title: 'Publish & Earn', description: 'Set your price and publish to the marketplace' }
  ];

  const progress = (currentStep / steps.length) * 100;

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && (storyText || draftContent)) {
      const saveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(saveTimer);
    }
  }, [storyText, draftContent, autoSave]);

  // Handle URL parameters for category pre-filling
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setCategory(categoryParam);
      generateTitleSuggestions(categoryParam);
    }
  }, []);

  const handleAutoSave = async () => {
    if (storyText || draftContent) {
      try {
        await saveDraft(draftContent || storyText, title, []);
        console.log('Auto-saved draft');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  };

  const generateTitleSuggestions = async (contentCategory?: string) => {
    try {
      const content = draftContent || storyText;
      if (content) {
        const suggestions = await suggestTitles(content, contentCategory || category);
        if (suggestions.length > 0) {
          const suggestedTitle = suggestions[0];
          const titleCheck = await checkTitle(suggestedTitle);
          
          if (titleCheck.isUnique) {
            setTitle(suggestedTitle);
            speak(`I've suggested the title: ${suggestedTitle}`);
          } else if (titleCheck.suggested) {
            setTitle(titleCheck.suggested);
            speak(`I've suggested an alternative title: ${titleCheck.suggested}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate title suggestions:', error);
    }
  };

  const handleVoiceCommand = (command: string) => {
    if (command === 'next_step') {
      nextStep();
    } else if (command === 'previous_step') {
      prevStep();
    } else if (command === 'save_draft') {
      handleManualSave();
    } else if (command === 'suggest_title') {
      generateTitleSuggestions();
    } else if (command.startsWith('set_title_')) {
      const newTitle = command.replace('set_title_', '').replace(/_/g, ' ');
      setTitle(newTitle);
      speak(`Title set to ${newTitle}`);
    } else if (command.startsWith('set_category_')) {
      const newCategory = command.replace('set_category_', '');
      setCategory(newCategory);
      generateTitleSuggestions(newCategory);
      speak(`Category set to ${newCategory}`);
    } else if (command === 'publish_now' && currentStep === 4) {
      handleComplete();
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleManualSave = async () => {
    try {
      await saveDraft(draftContent || storyText, title, []);
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved successfully.",
      });
      speak('Draft saved successfully');
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save your draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      speak(`Moving to step ${currentStep + 1}: ${steps[currentStep].title}`);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      speak(`Moving to step ${currentStep - 1}: ${steps[currentStep - 2].title}`);
    }
  };

  const handleComplete = () => {
    const productData = {
      story: storyText,
      draft: draftContent,
      template: selectedTemplate,
      publish: publishData,
      title,
      category
    };
    onComplete?.(productData);
    speak('Congratulations! Your eBook has been published successfully');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <VoiceInput
              value={storyText}
              onChange={setStoryText}
              label="Tell Your Story"
              placeholder="Share your life experiences, lessons learned, or expertise. You can speak or type..."
            />
            <VersionControl
              userId={userId}
              onDraftSelect={(draft) => {
                setStoryText(draft.content);
                setTitle(draft.title || '');
              }}
              onCommand={handleVoiceCommand}
            />
          </div>
        );
      case 2:
        return (
          <DraftEditor
            story={storyText}
            draft={draftContent}
            onChange={setDraftContent}
            title={title}
            onTitleChange={setTitle}
            category={category}
          />
        );
      case 3:
        return (
          <TemplateSelector
            selected={selectedTemplate}
            onChange={setSelectedTemplate}
          />
        );
      case 4:
        return (
          <PublishForm
            data={{...publishData, title, category}}
            onChange={setPublishData}
            onPublish={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return storyText.trim().length > 50;
      case 2: return draftContent.trim().length > 100;
      case 3: return selectedTemplate !== '';
      case 4: return Object.keys(publishData).length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-black to-cyber-dark p-4">
      <Card className="max-w-6xl mx-auto glass-morphism border-cyber-blue/20">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-hero mb-4">Create Your Digital Product</CardTitle>
          
          {/* Progress Bar */}
          <div className="space-y-4">
            <Progress value={progress} className="w-full h-3 bg-gray-700" />
            <div className="flex justify-between items-center">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-2 ${
                    step.id <= currentStep ? 'text-cyber-blue' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.id < currentStep
                        ? 'bg-green-500 text-white'
                        : step.id === currentStep
                        ? 'bg-cyber-blue text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {step.id < currentStep ? <CheckCircle size={20} /> : step.id}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-body">{step.title}</div>
                    <div className="text-sm text-gray-400 max-w-32">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current step info and save button */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-white text-body">
              {title && <span className="font-medium">Title: {title}</span>}
              {category && <span className="ml-4 text-gray-300">Category: {category}</span>}
            </div>
            <Button
              onClick={handleManualSave}
              className="btn-secondary flex items-center space-x-2"
              aria-label="Save current progress"
            >
              <Save size={16} />
              <span>Save Draft</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary flex items-center space-x-2"
              aria-label="Go to previous step"
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </Button>

            <div className="text-center">
              <span className="text-white text-body">
                Step {currentStep} of {steps.length}
              </span>
            </div>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="btn-primary flex items-center space-x-2"
                aria-label="Go to next step"
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="btn-primary bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                aria-label="Complete and publish"
              >
                <span>Complete</span>
                <CheckCircle size={20} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <VoiceAssistant onCommand={handleVoiceCommand} />
    </div>
  );
};

export default CreatorWizard;
