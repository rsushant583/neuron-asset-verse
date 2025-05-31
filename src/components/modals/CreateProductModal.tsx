
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCreateAIProduct } from '@/hooks/useAIProducts';
import ProductAssetUpload from '@/components/dashboard/ProductAssetUpload';
import { Loader, Plus } from 'lucide-react';

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProductForm {
  title: string;
  description: string;
  price: string;
  content_url: string;
  preview_image: string;
}

const CreateProductModal = ({ open, onOpenChange }: CreateProductModalProps) => {
  const [form, setForm] = useState<ProductForm>({
    title: '',
    description: '',
    price: '',
    content_url: '',
    preview_image: ''
  });
  const [errors, setErrors] = useState<Partial<ProductForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const createProduct = useCreateAIProduct();

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductForm> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProductForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAssetUploaded = (url: string, type: 'content' | 'preview') => {
    if (type === 'content') {
      setForm(prev => ({ ...prev, content_url: url }));
    } else {
      setForm(prev => ({ ...prev, preview_image: url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createProduct.mutateAsync({
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        content_url: form.content_url || null,
        preview_image: form.preview_image || null,
        is_active: true
      });

      toast({
        title: "Success",
        description: "Product created successfully!"
      });

      // Reset form and close modal
      setForm({
        title: '',
        description: '',
        price: '',
        content_url: '',
        preview_image: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Product creation failed:', error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-morphism border-cyber-blue/20">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Plus className="mr-2" size={20} />
            Create New Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter product title..."
              className={`bg-white/5 border-cyber-blue/20 text-white ${
                errors.title ? 'border-red-500' : ''
              }`}
            />
            {errors.title && (
              <p className="text-red-400 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your product..."
              rows={4}
              className={`bg-white/5 border-cyber-blue/20 text-white resize-none ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            {errors.description && (
              <p className="text-red-400 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-white">Price (USD) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0.00"
              className={`bg-white/5 border-cyber-blue/20 text-white ${
                errors.price ? 'border-red-500' : ''
              }`}
            />
            {errors.price && (
              <p className="text-red-400 text-sm">{errors.price}</p>
            )}
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <Label className="text-white">Product Assets</Label>
            <ProductAssetUpload
              onAssetUploaded={handleAssetUploaded}
              className="border border-cyber-blue/20 rounded-lg p-4"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-cyber-blue to-cyber-purple text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 animate-spin" size={16} />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductModal;
