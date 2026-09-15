import { useEffect, useState } from 'react';
import * as api from '../../lib/api';
import { GRADES, initials, relativeTime, tradColor, tradLabel } from '../../lib/constants';
import { useAgoraData } from '../../context/AgoraDataContext';
import { useSession } from '../../context/SessionContext';
import { useModal } from '../../components/modal/ModalProvider';
import { useToast } from '../../components/toast/ToastProvider';
import { BadgesGrid } from './BadgesGrid';
import { gradeOf } from './perfilData';

interface PublicProfile {
  id: string;
  display_name: string;
  religion_path: string;
  mana_xp: number;
  streak_days: number;
  is_verified: boolean;
}

interface PublicPost {
  created_at: string;
  content: string;
  media_urls: string[] | null;
}

// Porte de index.html:3959-4006 (openProfileModal) + o menu de mais opções
// (index.html:4009-4145): denunciar publicação/perfil e bloquear/desbloquear.
export function ProfileModal({ userId }: { userId: string }) {
  const { followingIds, blockedIds, toggleFollow, toggleBlock } = useAgoraData();
  const { push, pop } = useModal();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [stats, setStats] = useState<{
    mana_xp: number;
    streak_days: number;
    covensFounded: number;
    gratitudeCount: number;
    lunarCompletions: number;
    candleLights: number;
  } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.fetchPublicProfile(userId),
      api.fetchUserPosts(userId),
      api.fetchUserCovenFoundedCount(userId),
      api.fetchUserGratitudeCount(userId),
      api.fetchUserLunarCompletionCount(userId),
      api.fetchUserCandleLightsCount(userId),
    ])
      .then(([p, userPosts, covensFounded, gratitudeCount, lunarCompletions, candleLights]) => {
        if (!active) return;
        setProfile(p as unknown as PublicProfile);
        setPosts(userPosts as unknown as PublicPost[]);
        setStats({ mana_xp: p.mana_xp, streak_days: p.streak_days, covensFounded, gratitudeCount, lunarCompletions, candleLights });
      })
      .catch((err) => {
        console.error(err);
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  function openMenu() {
    const isBlocked = blockedIds.has(userId);
    const menuId = push(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="modal-title">Mais opções</div>
        <button
          className="btn-ghost"
          style={{ width: '100%' }}
          onClick={() => {
            pop(menuId);
            openReport();
          }}
        >
          Denunciar perfil
        </button>
        <button
          className="btn-ghost"
          style={{ width: '100%', color: 'var(--danger)' }}
          onClick={async () => {
            pop(menuId);
            try {
              await toggleBlock(userId);
              showToast(isBlocked ? 'Usuário desbloqueado.' : 'Usuário bloqueado. Você não verá mais o conteúdo dele(a).');
              pop();
            } catch (err) {
              console.error(err);
              showToast('Não foi possível concluir agora.');
            }
          }}
        >
          {isBlocked ? 'Desbloquear' : 'Bloquear'} {profile?.display_name || 'usuário'}
        </button>
      </div>,
    );
  }

  function openReport() {
    const reportId = push(<ReportForm targetId={userId} onDone={() => pop(reportId)} />);
  }

  if (error) {
    return (
      <div>
        <div className="modal-title">Não encontrado</div>
        <div className="node-sub">Não foi possível carregar esse perfil agora.</div>
      </div>
    );
  }
  if (!profile || !stats) {
    return <div className="modal-title">Carregando perfil…</div>;
  }

  const c = tradColor(profile.religion_path);
  const grade = gradeOf(profile.mana_xp);
  const isFollowing = followingIds.has(userId);
  const isBlocked = blockedIds.has(userId);

  return (
    <div>
      <div className="profile-modal-top">
        <div
          className="avatar-sm"
          style={{ width: 56, height: 56, fontSize: 18, background: `linear-gradient(145deg, ${c}, ${c}cc)` }}
        >
          {initials(profile.display_name)}
        </div>
        <div className="profile-modal-name">{profile.display_name}</div>
        <div className="node-sub">
          Grau {grade} · {GRADES[grade]} · {tradLabel(profile.religion_path)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, margin: '14px 0' }}>
        <button
          className="btn-primary"
          style={{ flex: 1, marginTop: 0 }}
          disabled={isBlocked}
          onClick={() => toggleFollow(userId).catch((err) => { console.error(err); showToast('Não foi possível concluir agora.'); })}
        >
          {isFollowing ? 'Deixar de seguir' : 'Seguir'}
        </button>
        <button className="btn-ghost" onClick={openMenu}>
          ⋯
        </button>
      </div>
      <div className="section-sub" style={{ marginBottom: 8 }}>
        Conquistas
      </div>
      <BadgesGrid stats={stats} />
      <div className="section-sub" style={{ margin: '18px 0 8px' }}>
        Publicações públicas
      </div>
      {posts.length ? (
        posts.map((p, i) => (
          <div className="public-post-item" key={i}>
            <div className="public-post-time">{relativeTime(p.created_at)}</div>
            <div className="public-post-text">{p.content}</div>
            {p.media_urls && p.media_urls.length ? (
              <img className="post-photo" src={p.media_urls[0]} alt="" loading="lazy" />
            ) : null}
          </div>
        ))
      ) : (
        <div className="empty-hint">Nenhuma publicação pública ainda.</div>
      )}
    </div>
  );
}

function ReportForm({ targetId, onDone }: { targetId: string; onDone: () => void }) {
  const { profile: myProfile } = useSession();
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);

  async function submit() {
    const trimmed = reason.trim();
    if (!trimmed || !myProfile) {
      showToast('Descreva o motivo da denúncia.');
      return;
    }
    setSending(true);
    try {
      await api.reportContent({ reporterId: myProfile.id, targetType: 'profile', targetId, reason: trimmed });
      showToast('Denúncia enviada. Nossa equipe vai analisar.');
      onDone();
    } catch (err) {
      setSending(false);
      showToast('Não foi possível enviar agora.');
      console.error(err);
    }
  }

  return (
    <div>
      <div className="modal-title">Denunciar perfil</div>
      <div className="node-sub" style={{ marginBottom: 12 }}>
        Conte o que está errado. Nossa equipe vai analisar.
      </div>
      <div className="form-field">
        <textarea
          placeholder="Descreva o motivo da denúncia…"
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} disabled={sending} onClick={submit}>
        {sending ? 'Enviando…' : 'Enviar denúncia'}
      </button>
    </div>
  );
}
