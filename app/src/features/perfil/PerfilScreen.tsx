import { useEffect, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAgoraData } from '../../context/AgoraDataContext';
import { useCovensData } from '../../context/CovensDataContext';
import { useEgregoraData } from '../../context/EgregoraDataContext';
import { useTrilhasData } from '../../context/TrilhasDataContext';
import { useToast } from '../../components/toast/ToastProvider';
import { signOut, updateProfile } from '../../lib/auth';
import * as api from '../../lib/api';
import { GRADES, FAMILIAR_STAGES, GLYPH, TRADITIONS } from '../../lib/constants';
import { AvatarSVG } from './AvatarSVG';
import { BadgesGrid } from './BadgesGrid';
import { ShopSection } from './ShopSection';
import { InstallSection } from './InstallSection';
import { StealthSection } from './StealthSection';
import { familiarStage, gradeOf, shopItem } from './perfilData';

function inviteLink(userId: string): string {
  return `${window.location.origin}${window.location.pathname}?ref=${userId}`;
}

// Porte de index.html:3166-3253 (renderPerfil). Grimório Público mostra
// fotos ilustrativas (mock, sem tabela própria — mesmo comportamento do
// app original); Reflexões usa as publicações reais do próprio usuário.
export function PerfilScreen() {
  const { profile, patchProfileLocal } = useSession();
  const { posts } = useAgoraData();
  const { covens } = useCovensData();
  const { candles, gratitude } = useEgregoraData();
  const { lunarQuests } = useTrilhasData();
  const { showToast } = useToast();
  const [subtab, setSubtab] = useState<'grimorio' | 'reflexoes'>('grimorio');
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    if (!profile) return;
    let active = true;
    api.fetchFollowCounts(profile.id).then((counts) => {
      if (active) setFollowCounts(counts);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  if (!profile) return null;

  const grade = gradeOf(profile.mana_xp);
  const stage = familiarStage(profile.mana_xp);
  const within = profile.mana_xp % 120;
  const myPosts = posts.filter((p) => p.userId === profile.id);

  async function handleTraditionChange(next: string) {
    const prev = profile!.religion_path;
    patchProfileLocal({ religion_path: next });
    try {
      await updateProfile(profile!.id, { religion_path: next });
      showToast('Senda religiosa atualizada ✦');
    } catch (err) {
      patchProfileLocal({ religion_path: prev });
      showToast('Não foi possível salvar sua senda agora.');
      console.error(err);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      window.location.reload();
    } catch (err) {
      showToast('Não foi possível sair agora.');
      console.error(err);
    }
  }

  const stats = {
    mana_xp: profile.mana_xp,
    streak_days: profile.streak_days,
    covensFounded: covens.filter((c) => c.createdBy === profile.id).length,
    gratitudeCount: gratitude.filter((g) => g.userId === profile.id).length,
    lunarCompletions: lunarQuests.filter((q) => q.done).length,
    candleLights: candles.filter((c) => c.lit).length,
  };

  return (
    <div style={{ padding: 16 }}>
      <div className="profile-top">
        <div className="avatar-stage">
          <AvatarSVG profile={profile} />
        </div>
        <div className="profile-name">{profile.display_name}</div>
        <div className="profile-grade">
          Grau {grade} · {GRADES[grade]}
          {profile.is_verified && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              width="13"
              height="13"
              style={{ display: 'inline-block', marginLeft: 4, verticalAlign: -2, color: 'var(--gold-soft)' }}
            >
              <title>Perfil verificado</title>
              <path d="M12 2l2.4 2.1 3.1-.4 1 3 2.9 1.4-.6 3.1 1.9 2.5-1.9 2.5.6 3.1-2.9 1.4-1 3-3.1-.4L12 22l-2.4-2.1-3.1.4-1-3-2.9-1.4.6-3.1L1.3 10l1.9-2.5-.6-3.1L5.5 3l1-3 3.1.4z" />
              <path d="M9 12.5l2 2 4-4.5" fill="none" stroke="#1a1420" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="familiar-tag">Familiar Astral: {FAMILIAR_STAGES[stage]}</div>
        <div className="familiar-tag">
          {shopItem('item', (profile.avatar_layers || { item: 'default' }).item).glyph}{' '}
          {shopItem('item', (profile.avatar_layers || { item: 'default' }).item).label}
        </div>
        <div className="follow-counts-row">
          <span>
            <b>{followCounts.following}</b> Seguindo
          </span>
          <span>
            <b>{followCounts.followers}</b> Seguidores
          </span>
        </div>

        <div className="mana-bar-wrap">
          <div className="mana-bar-track">
            <div className="mana-bar-fill" style={{ width: `${(within / 120) * 100}%` }} />
          </div>
          <div className="mana-nums">
            <span>{within} / 120 Mana</span>
            <span>Próximo grau</span>
          </div>
        </div>

        <div className="tradition-select-wrap">
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label htmlFor="traditionSelect">Senda Religiosa</label>
            <select
              id="traditionSelect"
              value={profile.religion_path}
              onChange={(e) => handleTraditionChange(e.target.value)}
            >
              {Object.entries(TRADITIONS).map(([k, v]) => (
                <option key={k} value={k}>
                  {GLYPH[k]} {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="subtabs">
        <button className={`subtab ${subtab === 'grimorio' ? 'active' : ''}`} onClick={() => setSubtab('grimorio')}>
          Grimório Público
        </button>
        <button className={`subtab ${subtab === 'reflexoes' ? 'active' : ''}`} onClick={() => setSubtab('reflexoes')}>
          Reflexões
        </button>
      </div>
      {subtab === 'grimorio' ? (
        <div className="grid-photos">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const c = ['#D4A853', '#8B6CF2', '#34C79A'][i % 3];
            return <div className="grid-photo" style={{ background: `linear-gradient(160deg,${c}55,#0b0c14)` }} key={i} />;
          })}
        </div>
      ) : myPosts.length ? (
        myPosts.map((po) => (
          <div className="reflection-item" key={po.id}>
            <div className="reflection-date">{po.time}</div>
            {po.content}
          </div>
        ))
      ) : (
        <div className="empty-hint">Nenhuma reflexão publicada ainda.</div>
      )}

      <div className="section-head" style={{ marginTop: 28 }}>
        <div className="section-title" style={{ fontSize: 19 }}>
          🏆 Conquistas
        </div>
        <div className="section-sub">Marcos da sua jornada no Arcanum</div>
      </div>
      <BadgesGrid stats={stats} />

      <div className="section-head" style={{ marginTop: 28 }}>
        <div className="section-title" style={{ fontSize: 19 }}>
          ✦ Convide Amigos
        </div>
        <div className="section-sub">Você e quem entrar pelo seu link ganham +50 Mana</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        <input type="text" readOnly value={inviteLink(profile.id)} style={{ flex: 1 }} />
        <button
          className="btn-primary"
          style={{ marginTop: 0 }}
          onClick={async () => {
            try {
              await navigator.clipboard?.writeText(inviteLink(profile.id));
              showToast('Link de convite copiado ✦');
            } catch {
              showToast('Selecione e copie o link manualmente.');
            }
          }}
        >
          Copiar
        </button>
      </div>

      <div className="section-head" style={{ marginTop: 28 }}>
        <div className="section-title" style={{ fontSize: 19 }}>
          🛍️ Loja de Mana
        </div>
        <div className="section-sub">Gaste seu Mana acumulado para customizar seu avatar e seu altar</div>
      </div>
      <ShopSection />

      <InstallSection />

      <StealthSection />

      <button className="btn-ghost" style={{ width: '100%' }} onClick={handleLogout}>
        Sair da conta
      </button>
    </div>
  );
}
