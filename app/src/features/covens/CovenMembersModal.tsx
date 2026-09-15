import { useEffect, useState } from 'react';
import * as api from '../../lib/api';
import { initials } from '../../lib/constants';
import { useSession } from '../../context/SessionContext';
import { useCovensData } from '../../context/CovensDataContext';
import { useToast } from '../../components/toast/ToastProvider';
import type { CovenMemberViewModel } from '../../types/covens';
import styles from './CovenMembersModal.module.css';

const ROLE_LABEL: Record<CovenMemberViewModel['role'], string> = {
  founder: 'Fundador(a)',
  moderator: 'Moderador(a)',
  member: 'Membro',
};

// Porte de index.html:4694-4743 (openCovenMembersModal/handleCovenToggleMod/handleCovenRemoveMember).
export function CovenMembersModal({ covenId, covenName }: { covenId: string; covenName: string }) {
  const { profile } = useSession();
  const { adjustMemberCount } = useCovensData();
  const { showToast } = useToast();
  const [members, setMembers] = useState<CovenMemberViewModel[] | null>(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .fetchCovenMembers(covenId)
      .then((rows) => {
        if (!active) return;
        setMembers(
          (rows as unknown as Array<{ user_id: string; display_name: string; is_verified: boolean; role: CovenMemberViewModel['role'] }>).map(
            (r) => ({ userId: r.user_id, displayName: r.display_name, isVerified: r.is_verified, role: r.role }),
          ),
        );
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('Não foi possível carregar os membros.');
      });
    return () => {
      active = false;
    };
  }, [covenId, reloadKey]);

  const myRole = members?.find((m) => m.userId === profile?.id)?.role || 'member';

  async function toggleMod(userId: string, currentRole: string) {
    const newRole = currentRole === 'moderator' ? 'member' : 'moderator';
    try {
      await api.updateCovenMemberRole(covenId, userId, newRole);
      if (newRole === 'moderator' && profile) {
        api.createNotification(userId, profile.id, 'coven_promote', covenId).catch(console.error);
      }
      showToast(newRole === 'moderator' ? 'Agora é moderador(a) ✦' : 'Deixou de ser moderador(a).');
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      showToast('Não foi possível atualizar o papel agora.');
    }
  }

  async function removeMember(userId: string) {
    try {
      await api.removeCovenMember(covenId, userId);
      adjustMemberCount(covenId, -1);
      if (profile) api.createNotification(userId, profile.id, 'coven_remove', covenId).catch(console.error);
      showToast('Membro removido do coven.');
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      showToast('Não foi possível remover esse membro.');
    }
  }

  return (
    <div>
      <div className="modal-title">Membros de {covenName}</div>
      {error && <div className="empty-hint">{error}</div>}
      {!error && !members && <div className="empty-hint">Carregando…</div>}
      {!error &&
        members?.map((m) => {
          const canPromote = myRole === 'founder' && m.role !== 'founder';
          const canRemove = (myRole === 'founder' || myRole === 'moderator') && m.role !== 'founder' && m.userId !== profile?.id;
          return (
            <div className={styles.row} key={m.userId}>
              <div className="avatar-sm" style={{ background: 'var(--panel-3)' }}>
                {initials(m.displayName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.name}>
                  {m.displayName}
                  {m.isVerified && (
                    <svg className={styles.verifiedBadge} viewBox="0 0 24 24" fill="currentColor" aria-label="Perfil verificado">
                      <path d="M12 2l2.4 2.1 3.1-.4 1 3 2.9 1.4-.6 3.1 1.9 2.5-1.9 2.5.6 3.1-2.9 1.4-1 3-3.1-.4L12 22l-2.4-2.1-3.1.4-1-3-2.9-1.4.6-3.1L1.3 10l1.9-2.5-.6-3.1L5.5 3l1-3 3.1.4z" />
                      <path d="M9 12.5l2 2 4-4.5" fill="none" stroke="#1a1420" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className={styles.role}>{ROLE_LABEL[m.role]}</div>
              </div>
              {canPromote && (
                <button className={`btn-ghost ${styles.btn}`} onClick={() => toggleMod(m.userId, m.role)}>
                  {m.role === 'moderator' ? 'Remover mod' : 'Tornar mod'}
                </button>
              )}
              {canRemove && (
                <button className={`btn-ghost ${styles.btn}`} style={{ color: 'var(--danger)' }} onClick={() => removeMember(m.userId)}>
                  Remover
                </button>
              )}
            </div>
          );
        })}
    </div>
  );
}
