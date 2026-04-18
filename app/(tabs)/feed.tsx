import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Colors, Fonts, FontSizes, Radius, Spacing, TextStyles } from '@/constants/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFeed, type Post } from '@/hooks/useFeed';

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function PostCard({ post, currentUserId, onDelete }: { post: Post; currentUserId: string; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const isOwn = post.user_id === currentUserId;
  const displayName = post.author_email?.split('@')[0] ?? 'lumé member';

  return (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName[0]?.toUpperCase() ?? 'L'}</Text>
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.postAuthor}>{displayName}</Text>
          <Text style={styles.postTime}>{timeAgo(post.created_at)}</Text>
        </View>
        {isOwn && (
          confirming ? (
            <View style={styles.confirmRow}>
              <TouchableOpacity onPress={() => { onDelete(post.id); setConfirming(false); }} style={styles.confirmYes}>
                <Text style={styles.confirmYesText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setConfirming(false)} style={styles.confirmNo}>
                <Text style={styles.confirmNoText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setConfirming(true)}>
              <Text style={styles.deleteBtn}>✕</Text>
            </TouchableOpacity>
          )
        )}
      </View>
      <Text style={[TextStyles.body, styles.postContent]}>{post.content}</Text>
      {post.photo_url && (
        <Image source={{ uri: post.photo_url }} style={styles.postImage} resizeMode="cover" />
      )}
      <View style={styles.postFooter}>
        <Text style={styles.likes}>♡  {post.likes_count}</Text>
      </View>
    </Card>
  );
}

export default function FeedScreen() {
  const { data: user } = useCurrentUser();
  const { data: posts, isLoading, refresh, createPost, deletePost } = useFeed();
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  async function handlePost() {
    if (!draft.trim() || !user?.id) return;
    setPosting(true);
    setPostError(null);
    try {
      await createPost(user.id, draft.trim());
      setDraft('');
      setComposing(false);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Could not post. Please try again.');
    } finally {
      setPosting(false);
    }
  }

  function handleDelete(postId: string) {
    void deletePost(postId).catch(() => null);
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[TextStyles.display2, styles.title]}>Community</Text>
        <TouchableOpacity onPress={() => setComposing((v) => !v)} style={styles.composeBtn}>
          <Text style={styles.composeBtnText}>{composing ? '✕' : '+ Share'}</Text>
        </TouchableOpacity>
      </View>

      {composing && (
        <Card style={styles.composeCard}>
          <TextInput
            style={styles.composeInput}
            value={draft}
            onChangeText={setDraft}
            placeholder="Share a glow moment, tip, or affirmation..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={280}
            autoFocus
          />
          {postError ? <Text style={styles.postError}>{postError}</Text> : null}
          <View style={styles.composeFooter}>
            <Text style={styles.charCount}>{draft.length}/280</Text>
            <Button
              label="Post"
              onPress={handlePost}
              disabled={!draft.trim()}
              loading={posting}
              style={styles.postBtn}
            />
          </View>
        </Card>
      )}

      {isLoading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginTop: Spacing.xl }} />
      ) : posts.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Be the first to share something with the community.</Text>
        </Card>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={user?.id ?? ''}
              onDelete={handleDelete}
            />
          )}
          onRefresh={refresh}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: { marginBottom: 0 },
  composeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  composeBtnText: { fontFamily: Fonts.bodySemiBold, fontSize: FontSizes.sm, color: Colors.gold },
  composeCard: { marginBottom: Spacing.md },
  composeInput: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.md,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  composeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  charCount: { fontFamily: Fonts.bodyRegular, fontSize: FontSizes.xs, color: Colors.textMuted },
  postBtn: { minHeight: 36, paddingVertical: 6 },
  list: { paddingBottom: Spacing.xl },
  postCard: { marginBottom: Spacing.sm },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.gold}30`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: { fontFamily: Fonts.displayMedium, fontSize: FontSizes.sm, color: Colors.gold },
  postMeta: { flex: 1 },
  postAuthor: { fontFamily: Fonts.bodySemiBold, fontSize: FontSizes.sm, color: Colors.text },
  postTime: { fontFamily: Fonts.bodyRegular, fontSize: FontSizes.xs, color: Colors.textMuted },
  deleteBtn: { fontSize: 14, color: Colors.textMuted, padding: 4 },
  postContent: { color: Colors.text, marginBottom: Spacing.sm },
  postImage: { width: '100%', height: 200, borderRadius: Radius.md, marginBottom: Spacing.sm },
  postFooter: { flexDirection: 'row', alignItems: 'center' },
  likes: { fontFamily: Fonts.bodyRegular, fontSize: FontSizes.sm, color: Colors.textSecondary },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { fontFamily: Fonts.bodyRegular, fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center' },
  postError: { fontFamily: Fonts.bodyRegular, fontSize: FontSizes.sm, color: Colors.error, marginBottom: Spacing.xs },
  confirmRow: { flexDirection: 'row', gap: Spacing.xs },
  confirmYes: { backgroundColor: Colors.error, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  confirmYesText: { fontFamily: Fonts.bodySemiBold, fontSize: FontSizes.xs, color: '#fff' },
  confirmNo: { borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  confirmNoText: { fontFamily: Fonts.bodyRegular, fontSize: FontSizes.xs, color: Colors.textMuted },
});
