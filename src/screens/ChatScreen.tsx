import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { fetchChatMessages, sendChatMessage, type ChatMessage } from '../services/chatService';
import { fetchPlaceById } from '../services/placeService';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ route }: Props) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { placeId, initialMessage } = route.params ?? {};
  const [placeName, setPlaceName] = useState('');
  const [message, setMessage] = useState(initialMessage ?? '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadPlace = async () => {
      if (!placeId) {
        return;
      }

      const place = await fetchPlaceById(placeId);
      const title = place?.name ?? '';
      setPlaceName(title);

      if (!initialMessage) {
        setMessage(t('chat.prefill', { title }));
      }
    };

    void loadPlace();
  }, [initialMessage, placeId, t]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!placeId) {
        return;
      }

      setMessages(await fetchChatMessages(placeId));
    };

    void loadMessages();
  }, [placeId]);

  const senderName = useMemo(
    () => user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'You',
    [user],
  );

  const handleSend = async () => {
    if (!placeId || !user?.id || !message.trim()) {
      return;
    }

    setIsSending(true);

    try {
      const nextMessage = await sendChatMessage({
        placeId,
        userId: user.id,
        senderName,
        body: message,
      });
      setMessages((current) => [...current, nextMessage]);
      setMessage('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Screen padded={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{t('chat.title')}</Text>
          <Text style={styles.title}>{placeName || t('chat.header')}</Text>
        </View>

        <Card>
          {messages.length === 0 ? (
            <Text style={styles.emptyState}>{t('chat.empty')}</Text>
          ) : (
            <FlatList
              contentContainerStyle={styles.messageList}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isOwn = item.userId === user?.id;

                return (
                  <View style={[styles.messageRow, isOwn ? styles.messageRowOwn : null]}>
                    <View style={[styles.messageBubble, isOwn ? styles.messageBubbleOwn : null]}>
                      <Text style={styles.messageSender}>{isOwn ? t('chat.you') : item.senderName}</Text>
                      <Text style={[styles.messageBody, isOwn ? styles.messageBodyOwn : null]}>
                        {item.body}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
          <TextInput
            multiline
            onChangeText={setMessage}
            placeholder={t('chat.input_placeholder')}
            placeholderTextColor={colors.textSoft}
            style={styles.input}
            textAlignVertical="top"
            value={message}
          />
          <Button disabled={isSending || !message.trim()} onPress={() => void handleSend()}>
            {t('chat.send')}
          </Button>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.lg,
    padding: spacing.md,
  },
  header: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.eyebrow,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleMd,
    lineHeight: typography.lineHeights.title,
  },
  emptyState: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.bodySm,
    lineHeight: 22,
    textAlign: 'center',
  },
  messageList: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  messageRow: {
    alignItems: 'flex-start',
    width: '100%',
  },
  messageRowOwn: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    gap: 4,
    maxWidth: '82%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageBubbleOwn: {
    backgroundColor: colors.text,
  },
  messageSender: {
    color: colors.textMuted,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.caption,
  },
  messageBody: {
    color: colors.text,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.bodySm,
    lineHeight: 22,
  },
  messageBodyOwn: {
    color: colors.white,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    color: colors.text,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
    minHeight: 180,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
