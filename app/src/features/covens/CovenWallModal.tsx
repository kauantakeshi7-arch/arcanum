import { useEffect, useRef, useState } from 'react';
import * as api from '../../lib/api';
import { compressImageToWebP } from '../../lib/image';
import { tradLabel } from '../../lib/constants';
import { useSession } from '../../context/SessionContext';
import { useCovensData } from '../../context/CovensDataContext';
import { useModal } from '../../components/modal/ModalProvider';
import { useToast } from '../../components/toast/ToastProvider';
import { CovenPostCard } from './CovenPostCard';
import { CovenMembersModal } from './CovenMembersModal';
import { EditCovenModal } from './EditCovenModal';
import type { CovenPostViewModel } from '../../types/covens';
import type { CovenPostCommentRow } from '../../types/db';
import styles from './CovenWallModal.module.css';

// Porte de index.html:4565-4691, 4067-4117 (openCovenWall e o mural rico:
// curtida, comentários, foto, editar/apagar a própria publicação).
export function CovenWallModal({ covenId }: { covenId: string }) {
  const { session, profile } = useSession();
  const { covens } = useCovensData();
  const { push, pop } = useModal();
  const { showToast } = useToast();
  const coven = covens.find((c) => c.id === covenId);

  const [posts, setPosts] = useState<CovenPostViewModel[] | null>(null);
  const [myLikeIds, setMyLikeIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState('');
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFounder = coven?.createdBy === profile?.id;

  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.all([api.fetchCovenPosts(covenId), api.fetchMyCovenPostLikeIds(session.user.id)])
      .then(([rows, likeIds]) => {
        if (!active) return;
        setMyLikeIds(likeIds);
        setPosts(
          (rows as unknown as Array<{
            id: string;
            user_id: string;
            content: string;
            media_url: string | null;
            created_at: string;
            author_name: string | null;
            likes_count: number;
            comments_count: number;
          }>).map((r) => ({
            id: r.id,
            userId: r.user_id,
            authorName: r.author_name || 'Alguém',
            content: r.content,
            mediaUrl: r.media_url,
            createdAt: r.created_at,
            likesCount: r.likes_count || 0,
            liked: likeIds.has(r.id),
            commentsCount: r.comments_count || 0,
            comments: [],
            commentsLoaded: false,
            showComments: false,
          })),
        );
      })
      .catch((err) => {
        console.error(err);
        if (active) setLoadError('Não foi possível carregar o mural.');
      });
    return () => {
      active = false;
    };
  }, [covenId, session]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await compressImageToWebP(file);
      setPhotoBlob(blob);
      setPhotoPreview(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      showToast('Não foi possível processar essa imagem.');
    }
  }

  async function handlePublish() {
    const content = draft.trim();
    if (!content || !session) return;
    setPublishing(true);
    try {
      let mediaUrl: string | null = null;
      if (photoBlob) mediaUrl = await api.uploadCovenPostMedia(session.user.id, photoBlob);
      const row = await api.postToCoven(covenId, session.user.id, content, mediaUrl);
      setPosts((prev) => [
        {
          id: row.id,
          userId: session.user.id,
          authorName: profile?.display_name || 'Alguém',
          content: row.content,
          mediaUrl: row.media_url,
          createdAt: row.created_at,
          likesCount: 0,
          liked: false,
          commentsCount: 0,
          comments: [],
          commentsLoaded: true,
          showComments: false,
        },
        ...(prev || []),
      ]);
      setDraft('');
      setPhotoBlob(null);
      setPhotoPreview(null);
    } catch (err) {
      console.error(err);
      showToast('Não foi possível publicar no coven.');
    } finally {
      setPublishing(false);
    }
  }

  async function toggleLike(postId: string) {
    if (!session) return;
    const wasLiked = myLikeIds.has(postId);
    setMyLikeIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setPosts((prev) =>
      (prev || []).map((p) => (p.id === postId ? { ...p, liked: !wasLiked, likesCount: p.likesCount + (wasLiked ? -1 : 1) } : p)),
    );
    try {
      if (wasLiked) await api.unlikeCovenPost(postId, session.user.id);
      else {
        await api.likeCovenPost(postId, session.user.id);
        const post = posts?.find((p) => p.id === postId);
        if (post?.userId) api.createNotification(post.userId, session.user.id, 'coven_post_like', covenId).catch(console.error);
      }
    } catch (err) {
      console.error(err);
      setMyLikeIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      setPosts((prev) =>
        (prev || []).map((p) => (p.id === postId ? { ...p, liked: wasLiked, likesCount: p.likesCount + (wasLiked ? 1 : -1) } : p)),
      );
      showToast('Não foi possível concluir agora.');
    }
  }

  async function toggleComments(postId: string) {
    const target = posts?.find((p) => p.id === postId);
    if (!target) return;
    const willExpand = !target.showComments;
    setPosts((prev) => (prev || []).map((p) => (p.id === postId ? { ...p, showComments: willExpand } : p)));
    if (willExpand && !target.commentsLoaded) {
      try {
        const rows = await api.fetchCovenPostComments(postId);
        setPosts((prev) =>
          (prev || []).map((p) =>
            p.id === postId
              ? {
                  ...p,
                  commentsLoaded: true,
                  comments: (rows as unknown as CovenPostCommentRow[]).map((r) => ({
                    authorName: r.author_name || 'Alguém',
                    content: r.content,
                  })),
                }
              : p,
          ),
        );
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function sendComment(postId: string, content: string) {
    if (!session || !profile) return;
    try {
      await api.postCovenComment(postId, session.user.id, content);
      setPosts((prev) =>
        (prev || []).map((p) =>
          p.id === postId
            ? { ...p, showComments: true, commentsCount: p.commentsCount + 1, comments: [...p.comments, { authorName: profile.display_name, content }] }
            : p,
        ),
      );
      const target = posts?.find((p) => p.id === postId);
      if (target?.userId) api.createNotification(target.userId, session.user.id, 'coven_post_comment', covenId).catch(console.error);
    } catch (err) {
      console.error(err);
      showToast('Não foi possível comentar agora.');
    }
  }

  function openPostMenu(postId: string) {
    const post = posts?.find((p) => p.id === postId);
    if (!post) return;
    const menuId = push(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="modal-title">Mais opções</div>
        <button
          className="btn-ghost"
          style={{ width: '100%' }}
          onClick={() => {
            pop(menuId);
            openEditPostModal(post.id, post.content);
          }}
        >
          Editar publicação
        </button>
        <button
          className="btn-ghost"
          style={{ width: '100%', color: 'var(--danger)' }}
          onClick={() => {
            pop(menuId);
            confirmDeletePost(post.id);
          }}
        >
          Apagar publicação
        </button>
      </div>,
    );
  }

  function openEditPostModal(postId: string, currentContent: string) {
    const editId = push(<EditPostModal postId={postId} currentContent={currentContent} onSaved={(content) => {
      setPosts((prev) => (prev || []).map((p) => (p.id === postId ? { ...p, content } : p)));
      pop(editId);
    }} />);
  }

  function confirmDeletePost(postId: string) {
    const confirmId = push(
      <div>
        <div className="modal-title">Apagar publicação</div>
        <div style={{ fontSize: 12, color: 'var(--text-low)', marginBottom: 16 }}>Essa ação não pode ser desfeita.</div>
        <button
          className="btn-ghost"
          style={{ width: '100%', color: 'var(--danger)' }}
          onClick={async () => {
            try {
              await api.deleteCovenPost(postId);
              setPosts((prev) => (prev || []).filter((p) => p.id !== postId));
              pop(confirmId);
              showToast('Publicação apagada.');
            } catch (err) {
              console.error(err);
              showToast('Não foi possível apagar agora.');
            }
          }}
        >
          Apagar definitivamente
        </button>
      </div>,
    );
  }

  function openMembers() {
    if (coven) push(<CovenMembersModal covenId={covenId} covenName={coven.name} />);
  }

  function openEdit() {
    if (coven) push(<EditCovenModal coven={coven} onSaved={() => {}} onDone={() => pop()} />);
  }

  if (!coven) return null;

  return (
    <div>
      <div className="modal-title">{coven.name}</div>
      <div className={styles.sub}>
        {tradLabel(coven.tradition)} · {coven.memberCount} membro{coven.memberCount === 1 ? '' : 's'}
      </div>
      <div className={styles.actionsRow}>
        <button className="btn-ghost" onClick={openMembers}>
          👥 Membros
        </button>
        {isFounder && (
          <button className="btn-ghost" onClick={openEdit}>
            ⚙ Editar
          </button>
        )}
      </div>
      {coven.pinnedAnnouncement && <div className={styles.pinned}>📌 {coven.pinnedAnnouncement}</div>}

      <div className="form-field" style={{ marginBottom: 8 }}>
        <textarea
          placeholder="Compartilhe algo com o coven…"
          maxLength={1000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </div>
      {photoPreview && <img className={styles.photoPreview} src={photoPreview} alt="" />}
      <div className={styles.actionsRow}>
        <button className="btn-ghost" onClick={() => fileInputRef.current?.click()}>
          📷 Foto
        </button>
        <button className="btn-primary" style={{ marginTop: 0 }} disabled={publishing || !draft.trim()} onClick={handlePublish}>
          {publishing ? 'Publicando…' : 'Publicar'}
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {loadError ? (
        <div className="empty-hint">{loadError}</div>
      ) : !posts ? (
        <div className="empty-hint">Carregando…</div>
      ) : posts.length === 0 ? (
        <div className="empty-hint">Nenhuma publicação ainda. Seja a primeira voz.</div>
      ) : (
        posts.map((post) => (
          <CovenPostCard
            key={post.id}
            post={post}
            tradition={coven.tradition}
            isMine={post.userId === profile?.id}
            onToggleLike={() => toggleLike(post.id)}
            onToggleComments={() => toggleComments(post.id)}
            onSendComment={(content) => sendComment(post.id, content)}
            onOpenMenu={() => openPostMenu(post.id)}
          />
        ))
      )}
    </div>
  );
}

function EditPostModal({ postId, currentContent, onSaved }: {
  postId: string;
  currentContent: string;
  onSaved: (content: string) => void;
}) {
  const { showToast } = useToast();
  const [content, setContent] = useState(currentContent);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const value = content.trim();
    if (!value) return;
    setSaving(true);
    try {
      await api.updateCovenPost(postId, value);
      onSaved(value);
      showToast('Publicação atualizada ✦');
    } catch (err) {
      console.error(err);
      showToast('Não foi possível salvar agora.');
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="modal-title">Editar publicação</div>
      <div className="form-field">
        <textarea maxLength={1000} value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} disabled={saving} onClick={handleSave}>
        {saving ? 'Salvando…' : 'Salvar'}
      </button>
    </div>
  );
}
