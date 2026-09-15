import { useRef, useState } from 'react';
import * as api from '../../lib/api';
import { compressImageToWebP } from '../../lib/image';
import { MOON_PHASE_INFO } from '../../lib/moon';
import { useSession } from '../../context/SessionContext';
import { useTrilhasData } from '../../context/TrilhasDataContext';
import { useAgoraData } from '../../context/AgoraDataContext';
import { useToast } from '../../components/toast/ToastProvider';
import type { LunarQuestViewModel } from '../../types/trilhas';

// Porte de index.html:2158-2233 (openLunarQuestModal).
export function LunarQuestModal({ quest, onDone }: { quest: LunarQuestViewModel; onDone: () => void }) {
  const { session, profile } = useSession();
  const { completeLunarQuest } = useTrilhasData();
  const { addLocalPost } = useAgoraData();
  const { showToast } = useToast();
  const info = MOON_PHASE_INFO[quest.phase];

  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [shareToFeed, setShareToFeed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Escolha um arquivo de imagem.');
      return;
    }
    try {
      const blob = await compressImageToWebP(file);
      setPhotoBlob(blob);
      setPhotoPreview(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      showToast('Não foi possível processar essa imagem.');
    }
  }

  function removePhoto() {
    setPhotoBlob(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit() {
    if (!photoBlob || !session || !profile) return;
    setSubmitting(true);
    try {
      const url = await api.uploadPostMedia(session.user.id, photoBlob);
      await completeLunarQuest(quest.id, url, shareToFeed);
      if (shareToFeed) {
        const row = await api.createPost({
          userId: session.user.id,
          religionPath: profile.religion_path,
          type: 'quest_proof',
          content: `Completei a missão do Passe Lunar: "${quest.title}" ✦`,
          mediaUrls: [url],
        });
        addLocalPost({
          id: row.id,
          userId: session.user.id,
          user: profile.display_name,
          verified: profile.is_verified,
          trad: profile.religion_path,
          type: row.type,
          time: 'agora',
          content: row.content,
          cards: [],
          media: row.media_urls || [],
          blessings: 0,
          reposts: 0,
          saved: false,
          reposted: false,
          liked: false,
          comments: [],
          commentsLoaded: true,
          showComments: false,
        });
      }
      onDone();
      showToast(`Missão comprovada · +${quest.mana} Mana ✦`);
    } catch (err) {
      console.error(err);
      showToast('Não foi possível registrar sua comprovação agora.');
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="modal-title">
        {info.glyph} {quest.title}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-mid)', marginBottom: 14 }}>{quest.description}</div>
      <button className="btn-ghost" style={{ width: '100%', marginBottom: 10 }} onClick={() => fileInputRef.current?.click()}>
        📷 Anexar foto de comprovação
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      {photoPreview && (
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <img src={photoPreview} alt="Pré-visualização" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12, display: 'block' }} />
          <button
            onClick={removePhoto}
            style={{
              position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', fontSize: 14, cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', cursor: 'pointer', fontSize: 12.5, color: 'var(--text-mid)' }}>
        <input type="checkbox" checked={shareToFeed} onChange={(e) => setShareToFeed(e.target.checked)} style={{ width: 'auto' }} />
        Compartilhar essa conquista na Ágora
      </label>
      <button className="btn-primary" style={{ width: '100%' }} disabled={!photoBlob || submitting} onClick={handleSubmit}>
        {submitting ? 'Enviando…' : `Comprovar e ganhar +${quest.mana} Mana`}
      </button>
    </div>
  );
}
