import { useEffect, useState } from 'react';
import * as api from '../../lib/api';
import { initials, relativeTime, tradColor } from '../../lib/constants';
import { useSession } from '../../context/SessionContext';
import { useModal } from '../../components/modal/ModalProvider';
import { DmThreadModal } from './DmThreadModal';
import { NewDmSearchModal } from './NewDmSearchModal';
import type { ConversationViewModel } from '../../types/dm';
import styles from './DmModal.module.css';

// Porte de index.html:3774-3809 (openDMs/renderDmList).
export function DmListModal() {
  const { session, profile } = useSession();
  const { push } = useModal();
  const [conversations, setConversations] = useState<ConversationViewModel[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    let active = true;
    api
      .fetchConversations(session.user.id)
      .then((rows) => {
        if (!active) return;
        setConversations(
          (rows as unknown as Array<{
            id: string;
            user1: { id: string; display_name: string };
            user2: { id: string; display_name: string };
            last_message: string | null;
            last_message_at: string | null;
          }>).map((c) => {
            const other = c.user1.id === session.user.id ? c.user2 : c.user1;
            return { id: c.id, otherId: other.id, otherName: other.display_name, lastMessage: c.last_message, lastMessageAt: c.last_message_at };
          }),
        );
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('Não foi possível carregar suas conversas.');
      });
    return () => {
      active = false;
    };
  }, [session]);

  function openThread(convo: ConversationViewModel) {
    push(<DmThreadModal conversationId={convo.id} otherId={convo.otherId} otherName={convo.otherName} />);
  }

  function openNewConversation() {
    push(<NewDmSearchModal onOpenThread={(content) => push(content)} />);
  }

  return (
    <div>
      <div className="modal-title">Mensagens</div>
      <button className="btn-ghost" style={{ width: '100%', marginBottom: 12 }} onClick={openNewConversation}>
        + Nova conversa
      </button>
      {error ? (
        <div className="empty-hint">{error}</div>
      ) : !conversations ? (
        <div className="empty-hint">Carregando…</div>
      ) : !conversations.length ? (
        <div className="empty-hint">Nenhuma conversa ainda.</div>
      ) : (
        conversations.map((c) => (
          <button className="dm-convo-row" key={c.id} onClick={() => openThread(c)}>
            <div className="avatar-sm" style={{ background: tradColor(profile?.religion_path || 'solitario') }}>
              {initials(c.otherName)}
            </div>
            <div className="dm-convo-info">
              <div className="dm-convo-name">{c.otherName}</div>
              <div className={styles.convoPreview}>{c.lastMessage || 'Diga olá ✦'}</div>
            </div>
            <div className={styles.convoTime}>{c.lastMessageAt ? relativeTime(c.lastMessageAt) : ''}</div>
          </button>
        ))
      )}
    </div>
  );
}
