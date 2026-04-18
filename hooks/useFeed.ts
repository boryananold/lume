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
  likedIds: Set<string>;
  isLoading: boolean;
  error: Error | null;
}

export function useFeed(userId?: string) {
  const [state, setState] = useState<FeedState>({
    data: [],
    likedIds: new Set(),
    isLoading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const [postsRes, likesRes] = await Promise.all([
        supabase
          .from('posts')
          .select('id, user_id, content, photo_url, likes_count, created_at, profiles(email)')
          .eq('is_flagged', false)
          .order('created_at', { ascending: false })
          .limit(50),
        userId
          ? supabase.from('post_likes').select('post_id').eq('user_id', userId)
          : Promise.resolve({ data: [] as { post_id: string }[], error: null }),
      ]);

      if (postsRes.error) throw postsRes.error;

      const posts: Post[] = (postsRes.data ?? []).map((row) => ({
        id: row.id as string,
        user_id: row.user_id as string,
        content: row.content as string,
        photo_url: row.photo_url as string | null,
        likes_count: row.likes_count as number,
        created_at: row.created_at as string,
        author_email: (Array.isArray(row.profiles)
          ? (row.profiles[0] as { email: string } | undefined)
          : (row.profiles as { email: string } | null))?.email,
      }));

      const likedIds = new Set(
        (likesRes.data ?? []).map((r) => (r as { post_id: string }).post_id)
      );

      setState({ data: posts, likedIds, isLoading: false, error: null });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false, error: err instanceof Error ? err : new Error(String(err)) }));
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const createPost = useCallback(async (authorId: string, content: string, photoUrl?: string) => {
    const { error } = await supabase.from('posts').insert({
      user_id: authorId,
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

  const likePost = useCallback(async (postId: string) => {
    if (!userId) return;
    // Optimistic update
    setState((s) => ({
      ...s,
      likedIds: new Set([...s.likedIds, postId]),
      data: s.data.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p),
    }));
    const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    if (error) {
      // Revert on failure
      setState((s) => ({
        ...s,
        likedIds: new Set([...s.likedIds].filter((id) => id !== postId)),
        data: s.data.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p),
      }));
    }
  }, [userId]);

  const unlikePost = useCallback(async (postId: string) => {
    if (!userId) return;
    // Optimistic update
    setState((s) => ({
      ...s,
      likedIds: new Set([...s.likedIds].filter((id) => id !== postId)),
      data: s.data.map((p) => p.id === postId ? { ...p, likes_count: Math.max(p.likes_count - 1, 0) } : p),
    }));
    const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    if (error) {
      // Revert on failure
      setState((s) => ({
        ...s,
        likedIds: new Set([...s.likedIds, postId]),
        data: s.data.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p),
      }));
    }
  }, [userId]);

  return { ...state, refresh: load, createPost, deletePost, likePost, unlikePost };
}
