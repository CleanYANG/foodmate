import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChatMessage = {
  id: string;
  placeId: string;
  userId: string;
  senderName: string;
  body: string;
  createdAt: string;
};

const STORAGE_KEY = 'citytalk.chat.v1';

type ChatMap = Record<string, ChatMessage[]>;

async function readChatMap(): Promise<ChatMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as ChatMap) : {};
  } catch {
    return {};
  }
}

async function writeChatMap(value: ChatMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export async function fetchChatMessages(placeId: string): Promise<ChatMessage[]> {
  const map = await readChatMap();
  return map[placeId] ?? [];
}

export async function sendChatMessage(input: {
  placeId: string;
  userId: string;
  senderName: string;
  body: string;
}): Promise<ChatMessage> {
  const text = input.body.trim();

  if (!text) {
    throw new Error('Message cannot be empty.');
  }

  const map = await readChatMap();
  const nextMessage: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    placeId: input.placeId,
    userId: input.userId,
    senderName: input.senderName.trim() || 'Anonymous',
    body: text,
    createdAt: new Date().toISOString(),
  };

  map[input.placeId] = [...(map[input.placeId] ?? []), nextMessage];
  await writeChatMap(map);

  return nextMessage;
}
