
import React, { useState } from 'react';
import { Upload, DollarSign, Globe, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface PublishFormProps {
  data: any;
  onChange: (data: any) => void;
  onPublish: () => void;
}

const PublishForm = ({ data, onChange, onPublish }: PublishFormProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [price, setPrice] = useState(data.price || 99);
  const [title, setTitle] = useState(data.title || '');
  const [description, setDescription] = useState(data.description || '');
  const [isPublic, setIsPublic] = useState(data.isPublic !== false);
  const [enableNFT, setEnableNFT] = useState(data.enableNFT || false);
  const { toast } = useToast();

  const updateData = (updates: any) => {
    const newData = { ...data, ...updates };
    onChange(newData);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your product.",
        variant: "destructive",
      });
      return;
    }

    if (price < 1) {
      toast({
        title: "Invalid Price",
        description: "Price must be at least ₹1.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);

    try {
      // Voice feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Publishing your product to the marketplace...');
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }

      // Simulate publishing process
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Product Published!",
        description: `"${title}" is now live on the marketplace.`,
      });

      // Voice feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Congratulations! Your product ${title} has been published successfully.`);
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }

      onPublish();
    } catch (error) {
      toast({
        title: "Publishing Failed",
        description: "Unable to publish your product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card className="glass-morphism border-cyber-blue/20">
      <CardHeader>
        <CardTitle className="text-white text-heading flex items-center space-x-2">
          <Upload size={24} />
          <span>Publish & Earn</span>
        </CardTitle>
        <p className="text-gray-400 text-body">
          Set your price and publish your wisdom to the marketplace. Start earning from your life experiences!
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-white text-body font-semibold">
            Product Title *
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              updateData({ title: e.target.value });
            }}
            className="input-accessible"
            placeholder="e.g., Life Lessons from 40 Years in Business"
            aria-label="Product title"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-white text-body font-semibold">
            Product Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              updateData({ description: e.target.value });
            }}
            className="input-accessible min-h-[120px]"
            placeholder="Describe what readers will learn from your wisdom..."
            aria-label="Product description"
          />
        </div>

        {/* Price Input */}
        <div className="space-y-2">
          <label htmlFor="price" className="text-white text-body font-semibold">
            Price (₹)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => {
                const newPrice = parseInt(e.target.value) || 0;
                setPrice(newPrice);
                updateData({ price: newPrice });
              }}
              className="input-accessible pl-12"
              min="1"
              step="1"
              aria-label="Product price in rupees"
            />
          </div>
          <p className="text-gray-400 text-sm">Recommended: ₹99 - ₹499 for eBooks</p>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              {isPublic ? <Globe size={20} className="text-green-400" /> : <Lock size={20} className="text-gray-400" />}
              <span className="text-white text-body font-semibold">
                {isPublic ? 'Public Listing' : 'Private Product'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              {isPublic ? 'Visible to all users on the marketplace' : 'Only accessible via direct link'}
            </p>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={(checked) => {
              setIsPublic(checked);
              updateData({ isPublic: checked });
            }}
            aria-label="Toggle public visibility"
          />
        </div>

        {/* NFT Minting Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Zap size={20} className={enableNFT ? "text-yellow-400" : "text-gray-400"} />
              <span className="text-white text-body font-semibold">
                Create NFT Certificate
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Mint your product as an NFT for blockchain ownership verification
            </p>
          </div>
          <Switch
            checked={enableNFT}
            onCheckedChange={(checked) => {
              setEnableNFT(checked);
              updateData({ enableNFT: checked });
            }}
            aria-label="Toggle NFT creation"
          />
        </div>

        {/* Earnings Preview */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">Earnings Preview:</h4>
          <div className="space-y-1 text-green-700">
            <div className="flex justify-between text-body">
              <span>Price per sale:</span>
              <span>₹{price}</span>
            </div>
            <div className="flex justify-between text-body">
              <span>Platform fee (10%):</span>
              <span>₹{Math.round(price * 0.1)}</span>
            </div>
            <div className="flex justify-between text-body font-semibold border-t border-green-300 pt-1">
              <span>You earn per sale:</span>
              <span>₹{Math.round(price * 0.9)}</span>
            </div>
          </div>
        </div>

        {/* Publish Button */}
        <Button
          onClick={handlePublish}
          disabled={isPublishing || !title.trim()}
          className="w-full btn-accessible bg-green-600 hover:bg-green-700 text-xl py-6"
          aria-label="Publish product to marketplace"
        >
          {isPublishing ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Publishing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Upload size={24} />
              <span>Publish & Start Earning</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PublishForm;
