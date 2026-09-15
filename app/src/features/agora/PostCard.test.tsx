import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCard } from './PostCard';
import { useAgoraData } from '../../context/AgoraDataContext';
import type { PostViewModel } from '../../types/agora';

vi.mock('../../context/AgoraDataContext', () => ({
  useAgoraData: vi.fn(),
}));

function makePost(overrides: Partial<PostViewModel> = {}): PostViewModel {
  return {
    id: 'post-1',
    userId: 'user-1',
    user: 'Aurora',
    verified: false,
    trad: 'umbanda',
    type: 'text',
    time: 'há 2h',
    content: 'Uma reflexão sobre a lua cheia.',
    cards: [],
    media: [],
    blessings: 3,
    reposts: 0,
    saved: false,
    reposted: false,
    liked: false,
    comments: [],
    commentsLoaded: false,
    showComments: false,
    ...overrides,
  };
}

describe('PostCard', () => {
  const toggleLike = vi.fn();
  const toggleRepost = vi.fn();
  const toggleSave = vi.fn();
  const toggleComments = vi.fn();
  const sendComment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sendComment.mockResolvedValue(undefined);
    vi.mocked(useAgoraData).mockReturnValue({
      toggleLike,
      toggleRepost,
      toggleSave,
      toggleComments,
      sendComment,
    } as unknown as ReturnType<typeof useAgoraData>);
  });

  it('mostra o conteúdo, a tradição e a contagem de Axé do post', () => {
    render(<PostCard post={makePost()} />);
    expect(screen.getByText('Uma reflexão sobre a lua cheia.')).toBeInTheDocument();
    expect(screen.getByText(/Umbanda/)).toBeInTheDocument();
    expect(screen.getByText('3 Axé')).toBeInTheDocument();
  });

  it('chama toggleLike com o id do post ao clicar em Axé', async () => {
    const user = userEvent.setup();
    render(<PostCard post={makePost()} />);
    await user.click(screen.getByText('3 Axé').closest('button')!);
    expect(toggleLike).toHaveBeenCalledWith('post-1');
  });

  it('chama toggleComments ao clicar no ícone de comentários', async () => {
    const user = userEvent.setup();
    render(<PostCard post={makePost({ comments: [{ authorName: 'Alguém', content: 'Axé!' }] })} />);
    await user.click(screen.getByText('1').closest('button')!);
    expect(toggleComments).toHaveBeenCalledWith('post-1');
  });

  it('envia um novo comentário e limpa o campo', async () => {
    const user = userEvent.setup();
    render(<PostCard post={makePost({ showComments: true, commentsLoaded: true })} />);
    const input = screen.getByPlaceholderText('Escreva com respeito…');
    await user.type(input, 'Que reflexão linda');
    await user.click(screen.getByText('Enviar'));
    expect(sendComment).toHaveBeenCalledWith('post-1', 'Que reflexão linda');
    expect(input).toHaveValue('');
  });
});
