import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      return data as SearchResult[];
    },
    enabled: searchQuery.length >= 1,
  });

  return {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
  };
};
