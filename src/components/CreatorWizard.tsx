
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import VoiceInput from './VoiceInput';
import DraftEditor from './DraftEditor';
import TemplateSelector from './TemplateSelector';
import PublishForm from './PublishForm';

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

  const steps = [
    { id: 1, title: 'Tell Your Story', description: 'Share your life experiences and wisdom' },
    { id: 2, title: 'Edit Your Draft', description: 'Review and refine the AI-generated content' },
    { id: 3, title: 'Choose Template', description: 'Select a beautiful design for your product' },
    { id: 4, title: 'Publish & Earn', description: 'Set your price and publish to the marketplace' }
  ];

  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      // Voice feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Moving to step ${currentStep + 1}: ${steps[currentStep].title}`);
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Voice feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Moving to step ${currentStep - 1}: ${steps[currentStep - 2].title}`);
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleComplete = () => {
    const productData = {
      story: storyText,
      draft: draftContent,
      template: selectedTemplate,
      publish: publishData
    };
    onComplete?.(productData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VoiceInput
            value={storyText}
            onChange={setStoryText}
            label="Tell Your Story"
            placeholder="Share your life experiences, lessons learned, or expertise. You can speak or type..."
          />
        );
      case 2:
        return (
          <DraftEditor
            story={storyText}
            draft={draftContent}
            onChange={setDraftContent}
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
            data={publishData}
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
    </div>
  );
};

export default CreatorWizard;
