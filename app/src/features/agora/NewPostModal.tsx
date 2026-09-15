import { useRef, useState } from 'react';
import * as api from '../../lib/api';
import { compressImageToWebP } from '../../lib/image';
import { GLYPH, TRADITIONS } from '../../lib/constants';
import { useSession } from '../../context/SessionContext';
import type { PostViewModel } from '../../types/agora';

// Porte de index.html:4248-4329 (openNewPostModal).
export function NewPostModal({ onPublished, onDone }: {
  onPublished: (post: PostViewModel) => void;
  onDone: () => void;
}) {
  const { session, profile } = useSession();
  const [trad, setTrad] = useState(profile?.religion_path || 'solitario');
  const [text, setText] = useState('');
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'publishing'>('idle');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Escolha um arquivo de imagem.');
      return;
    }
    try {
      const blob = await compressImageToWebP(file);
      setPhotoBlob(blob);
      setPhotoPreview(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError('Não foi possível processar essa imagem.');
    }
  }

  function removePhoto() {
    setPhotoBlob(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit() {
    if (!session || !profile) return;
    const content = text.trim();
    if (!content && !photoBlob) {
      setError('Escreva algo ou adicione uma foto.');
      return;
    }
    setError('');
    setStatus(photoBlob ? 'uploading' : 'publishing');
    try {
      let mediaUrls: string[] | null = null;
      if (photoBlob) {
        const url = await api.uploadPostMedia(session.user.id, photoBlob);
        mediaUrls = [url];
      }
      setStatus('publishing');
      const row = await api.createPost({
        userId: session.user.id,
        religionPath: trad,
        type: photoBlob ? 'altar_photo' : 'text',
        content: content || 'Compartilhando meu altar hoje.',
        mediaUrls,
      });
      onPublished({
        id: row.id,
        userId: session.user.id,
        user: profile.display_name,
        verified: profile.is_verified,
        trad,
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
      onDone();
    } catch (err) {
      console.error(err);
      setError('Não foi possível publicar agora. Tente de novo.');
      setStatus('idle');
    }
  }

  return (
    <div>
      <div className="modal-title">Nova Publicação</div>
      <div className="form-field">
        <label htmlFor="newPostTrad">Tradição</label>
        <select id="newPostTrad" value={trad} onChange={(e) => setTrad(e.target.value)}>
          {Object.entries(TRADITIONS).map(([k, v]) => (
            <option key={k} value={k}>
              {GLYPH[k]} {v.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="newPostText">Sua reflexão</label>
        <textarea
          id="newPostText"
          maxLength={600}
          placeholder="Compartilhe uma reflexão, dúvida ou vivência…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div style={{ fontSize: 11, color: 'var(--text-low)', textAlign: 'right', marginTop: 4 }}>
          {text.length}/600
        </div>
      </div>
      <button className="btn-ghost" style={{ width: '100%', marginBottom: 10 }} onClick={() => fileInputRef.current?.click()}>
        📷 Adicionar foto do altar
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      {photoPreview && (
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <img src={photoPreview} alt="Pré-visualização" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 12, display: 'block' }} />
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
      {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 10 }}>{error}</div>}
      <button className="btn-primary" style={{ width: '100%' }} disabled={status !== 'idle'} onClick={handleSubmit}>
        {status === 'uploading' ? 'Enviando foto…' : status === 'publishing' ? 'Publicando…' : 'Publicar'}
      </button>
    </div>
  );
}
