import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  photo_url: string | null;
  likes_count: number;
  created_at: string;
  author_email?: string;
}

interface FeedState {
  data: Post[];
  isLoading: boolean;
  error: Error | null;
}

export function useFeed() {
  const [state, setState] = useState<FeedState>({ data: [], isLoading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, user_id, content, photo_url, likes_count, created_at, profiles(email)')
        .eq('is_flagged', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const posts: Post[] = (data ?? []).map((row) => ({
        id: row.id as string,
        user_id: row.user_id as string,
        content: row.content as string,
        photo_url: row.photo_url as string | null,
        likes_count: row.likes_count as number,
        created_at: row.created_at as string,
        author_email: (Array.isArray(row.profiles) ? (row.profiles[0] as { email: string } | undefined) : (row.profiles as { email: string } | null))?.email,
      }));

      setState({ data: posts, isLoading: false, error: null });
    } catch (err) {
      setState({ data: [], isLoading: false, error: err instanceof Error ? err : new Error(String(err)) });
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const createPost = useCallback(async (userId: string, content: string, photoUrl?: string) => {
    const { error } = await supabase.from('posts').insert({
      user_id: userId,
      content,
      photo_url: photoUrl ?? null,
    });
    if (error) throw error;
    await load();
  }, [load]);

  const deletePost = useCallback(async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
    await load();
  }, [load]);

  return { ...state, refresh: load, createPost, deletePost };
}
