
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AIProduct {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  content_url?: string;
  preview_image?: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  users?: {
    username: string;
    avatar_url?: string;
  };
}

export const useAIProducts = () => {
  return useQuery({
    queryKey: ['ai-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_products')
        .select(`
          *,
          users (
            username,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AIProduct[];
    }
  });
};

export const useUserAIProducts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-ai-products', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ai_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AIProduct[];
    },
    enabled: !!user
  });
};

export const useCreateAIProduct = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (product: Omit<AIProduct, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('ai_products')
        .insert({
          ...product,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-products'] });
      queryClient.invalidateQueries({ queryKey: ['user-ai-products'] });
    }
  });
};
