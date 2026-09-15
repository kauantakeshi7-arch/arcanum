import { useEffect, useRef, useState } from 'react';
import * as api from '../../lib/api';
import { useSession } from '../../context/SessionContext';
import { useDmData } from '../../context/DmDataContext';
import { useToast } from '../../components/toast/ToastProvider';
import type { MessageViewModel } from '../../types/dm';
import styles from './DmModal.module.css';

// Porte de index.html:4170-4209 (openDmThread) — inscreve no Realtime
// enquanto o modal está aberto e cancela ao fechar (efeito de limpeza).
export function DmThreadModal({ conversationId, otherId, otherName }: {
  conversationId: string;
  otherId: string;
  otherName: string;
}) {
  const { session } = useSession();
  const { refreshUnreadCount } = useDmData();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<MessageViewModel[] | null>(null);
  const [draft, setDraft] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const rows = await api.fetchMessages(conversationId);
    setMessages(
      (rows as unknown as Array<{ id: string; conversation_id: string; sender_id: string; content: string }>).map((r) => ({
        id: r.id,
        conversationId: r.conversation_id,
        senderId: r.sender_id,
        content: r.content,
      })),
    );
  }

  useEffect(() => {
    if (!session) return;
    let active = true;

    loadMessages()
      .then(() => api.markMessagesRead(conversationId, session.user.id))
      .then(refreshUnreadCount)
      .catch(console.error);

    const unsubscribe = api.subscribeToMessages(conversationId, (raw) => {
      if (!active) return;
      const row = raw as { sender_id: string };
      if (row.sender_id !== session.user.id) {
        loadMessages().catch(console.error);
        api.markMessagesRead(conversationId, session.user.id).then(refreshUnreadCount).catch(console.error);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, session]);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || !session) return;
    setDraft('');
    try {
      await api.sendMessage(conversationId, session.user.id, text);
      await loadMessages();
      api.createNotification(otherId, session.user.id, 'message', conversationId).catch(console.error);
    } catch (err) {
      console.error(err);
      showToast('Não foi possível enviar a mensagem.');
    }
  }

  return (
    <div>
      <div className="modal-title">{otherName}</div>
      <div className={styles.messages} ref={boxRef}>
        {!messages ? (
          <div className="empty-hint">Carregando…</div>
        ) : messages.length ? (
          messages.map((m) => (
            <div className={`${styles.bubble} ${m.senderId === session?.user.id ? styles.me : ''}`} key={m.id}>
              {m.content}
            </div>
          ))
        ) : (
          <div className="empty-hint">Nenhuma mensagem ainda. Diga olá ✦</div>
        )}
      </div>
      <div className="comment-input-row">
        <input
          type="text"
          placeholder="Escreva com respeito…"
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
    </div>
  );
}
