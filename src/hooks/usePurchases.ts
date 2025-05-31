
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Purchase {
  id: string;
  buyer_id: string;
  ai_product_id: string;
  price: number;
  created_at: string;
  ai_products?: {
    title: string;
    preview_image?: string;
    users?: {
      username: string;
    };
  };
}

export const useUserPurchases = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-purchases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          ai_products (
            title,
            preview_image,
            users (
              username
            )
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Purchase[];
    },
    enabled: !!user
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ ai_product_id, price }: { ai_product_id: string; price: number }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('purchases')
        .insert({
          buyer_id: user.id,
          ai_product_id,
          price
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-purchases'] });
    }
  });
};
