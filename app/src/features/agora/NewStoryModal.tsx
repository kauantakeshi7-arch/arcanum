import { useRef, useState } from 'react';
import * as api from '../../lib/api';
import { compressImageToWebP } from '../../lib/image';
import { useSession } from '../../context/SessionContext';
import { useAgoraData } from '../../context/AgoraDataContext';
import styles from './Stories.module.css';

const COLORS = ['#8B6CF2', '#34C79A', '#D4A853', '#C1614A', '#3B4A6B'];

// Porte de index.html:1756-1848 (openNewStoryModal).
export function NewStoryModal({ onDone }: { onDone: () => void }) {
  const { session, profile } = useSession();
  const { addLocalStory } = useAgoraData();
  const [mode, setMode] = useState<'photo' | 'text'>('photo');
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canPublish = mode === 'photo' ? !!photoBlob : text.trim().length > 0;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await compressImageToWebP(file);
      setPhotoBlob(blob);
      setPhotoPreview(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePublish() {
    if (!session || !profile || !canPublish) return;
    setPublishing(true);
    try {
      let mediaUrl: string | null = null;
      if (mode === 'photo' && photoBlob) mediaUrl = await api.uploadStoryMedia(session.user.id, photoBlob);
      const row = await api.createStory({
        userId: session.user.id,
        mediaUrl,
        textContent: mode === 'text' ? text.trim() : null,
        bgColor: mode === 'text' ? color : null,
      });
      addLocalStory({
        userId: session.user.id,
        name: profile.display_name,
        trad: profile.religion_path,
        verified: profile.is_verified,
        items: [
          {
            id: row.id,
            mediaUrl: row.media_url,
            textContent: row.text_content,
            bgColor: row.bg_color,
            createdAt: row.created_at,
          },
        ],
      });
      onDone();
    } catch (err) {
      console.error(err);
      setPublishing(false);
    }
  }

  return (
    <div>
      <div className="modal-title">Nova Story</div>
      <p style={{ fontSize: 11.5, color: 'var(--text-low)', marginBottom: 14 }}>
        Fica visível por 24 horas para a comunidade.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          className={`btn-ghost ${styles.storyTypeBtn} ${mode === 'photo' ? styles.active : ''}`}
          style={{ flex: 1 }}
          onClick={() => setMode('photo')}
        >
          📷 Foto
        </button>
        <button
          className={`btn-ghost ${styles.storyTypeBtn} ${mode === 'text' ? styles.active : ''}`}
          style={{ flex: 1 }}
          onClick={() => setMode('text')}
        >
          ✎ Texto
        </button>
      </div>

      {mode === 'photo' ? (
        <div>
          <button className="btn-ghost" style={{ width: '100%', marginBottom: 10 }} onClick={() => fileInputRef.current?.click()}>
            📷 Escolher foto
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          {photoPreview && (
            <img src={photoPreview} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12, marginTop: 4 }} />
          )}
        </div>
      ) : (
        <div>
          <div className="form-field">
            <textarea
              placeholder="Escreva algo…"
              maxLength={180}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-low)', marginBottom: 8 }}>Cor de fundo</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {COLORS.map((c) => (
              <button
                key={c}
                className={`${styles.colorSwatch} ${color === c ? styles.active : ''}`}
                style={{ background: c }}
                aria-label="Cor de fundo"
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
      )}

      <button className="btn-primary" style={{ width: '100%' }} disabled={!canPublish || publishing} onClick={handlePublish}>
        {publishing ? 'Publicando…' : 'Publicar Story'}
      </button>
    </div>
  );
}
