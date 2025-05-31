
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NFTMintRequest {
  id: string;
  ai_product_id: string;
  user_id: string;
  status: 'pending' | 'minted' | 'failed';
  txn_hash?: string;
  metadata_url?: string;
  created_at: string;
  updated_at: string;
  ai_products?: {
    title: string;
    preview_image?: string;
  };
}

export const useUserMintRequests = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-mint-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('nft_mint_requests')
        .select(`
          *,
          ai_products (
            title,
            preview_image
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as NFTMintRequest[];
    },
    enabled: !!user
  });
};

export const useCreateMintRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ ai_product_id }: { ai_product_id: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('nft_mint_requests')
        .insert({
          ai_product_id,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-mint-requests'] });
    }
  });
};
