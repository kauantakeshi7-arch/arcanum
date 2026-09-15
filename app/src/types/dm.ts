export interface ConversationViewModel {
  id: string;
  otherId: string;
  otherName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

export interface MessageViewModel {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
}
