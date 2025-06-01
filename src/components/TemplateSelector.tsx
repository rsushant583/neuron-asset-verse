
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Palette } from 'lucide-react';

interface TemplateSelectorProps {
  selected: string;
  onChange: (templateId: string) => void;
}

const TemplateSelector = ({ selected, onChange }: TemplateSelectorProps) => {
  const templates = [
    {
      id: 'soft-pink',
      name: 'Soft Pink Elegance',
      description: 'Warm and elegant design with soft pink accents. Perfect for personal stories and memoirs.',
      color: '#F8BBD9',
      preview: '/placeholder.svg',
      voiceDescription: 'Soft Pink: Warm, elegant design perfect for personal stories'
    },
    {
      id: 'classic-blue',
      name: 'Classic Blue Professional',
      description: 'Professional and trustworthy design with classic blue tones. Ideal for business wisdom and guides.',
      color: '#4B8BBE',
      preview: '/placeholder.svg',
      voiceDescription: 'Classic Blue: Professional design ideal for business guides'
    },
    {
      id: 'sage-green',
      name: 'Sage Green Natural',
      description: 'Calming and natural design with sage green elements. Great for wellness and life advice.',
      color: '#9CAF88',
      preview: '/placeholder.svg',
      voiceDescription: 'Sage Green: Calming design great for wellness advice'
    },
    {
      id: 'warm-orange',
      name: 'Warm Orange Energy',
      description: 'Energetic and inspiring design with warm orange highlights. Perfect for motivational content.',
      color: '#F4A261',
      preview: '/placeholder.svg',
      voiceDescription: 'Warm Orange: Energetic design perfect for motivational content'
    }
  ];

  const selectTemplate = (templateId: string) => {
    onChange(templateId);
    
    const template = templates.find(t => t.id === templateId);
    if (template && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Selected ${template.voiceDescription}`);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="glass-morphism border-cyber-blue/20">
      <CardHeader>
        <CardTitle className="text-white text-heading flex items-center space-x-2">
          <Palette size={24} />
          <span>Choose Your Template</span>
        </CardTitle>
        <p className="text-gray-400 text-body">
          Select a beautiful design template for your digital product. Each template is optimized for readability and visual appeal.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`relative rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                selected === template.id
                  ? 'border-cyber-blue bg-cyber-blue/10'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
              onClick={() => selectTemplate(template.id)}
            >
              {/* Template Preview */}
              <div className="p-4">
                <div 
                  className="w-full h-48 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: template.color }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📖</div>
                    <div>Preview</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-white text-heading font-semibold">{template.name}</h3>
                  <p className="text-gray-400 text-body">{template.description}</p>
                  
                  <Button
                    className={`w-full btn-accessible ${
                      selected === template.id
                        ? 'bg-cyber-blue text-white'
                        : 'btn-secondary'
                    }`}
                    aria-label={`Select ${template.name} template`}
                  >
                    {selected === template.id ? (
                      <div className="flex items-center space-x-2">
                        <Check size={20} />
                        <span>Selected</span>
                      </div>
                    ) : (
                      'Select Template'
                    )}
                  </Button>
                </div>
              </div>

              {/* Selection Indicator */}
              {selected === template.id && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-cyber-blue rounded-full flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Template Features:</h4>
          <ul className="text-yellow-700 space-y-1 text-body">
            <li>• Professional typography optimized for reading</li>
            <li>• High contrast colors for better accessibility</li>
            <li>• Mobile-friendly responsive design</li>
            <li>• Print-ready PDF generation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
