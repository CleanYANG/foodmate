import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Moment } from '../types/moment';
import type { Place } from '../types/place';

const STORAGE_KEY = 'citytalk.moments';

type MomentsContextValue = {
  moments: Moment[];
  isLoading: boolean;
  saveMoment: (place: Place, text: string) => Promise<void>;
};

const MomentsContext = createContext<MomentsContextValue | undefined>(undefined);

export function MomentsProvider({ children }: PropsWithChildren) {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMoments = async () => {
      try {
        const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
        setMoments(rawValue ? (JSON.parse(rawValue) as Moment[]) : []);
      } finally {
        setIsLoading(false);
      }
    };

    void loadMoments();
  }, []);

  const persist = useCallback(async (nextMoments: Moment[]) => {
    setMoments(nextMoments);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextMoments));
  }, []);

  const saveMoment = useCallback(
    async (place: Place, text: string) => {
      const trimmedText = text.trim();

      if (!trimmedText) {
        throw new Error('Moment text cannot be empty.');
      }

      const nextMoment: Moment = {
        id: `moment-${Date.now()}`,
        userId: 'local-user',
        placeId: place.id,
        city: place.city ?? 'Sapporo',
        placeName: place.name,
        placeImageUrl: typeof place.imageUrl === 'string' ? place.imageUrl : null,
        userImageUrl: null,
        text: trimmedText,
        createdAt: new Date().toISOString(),
        vibeTags: place.tags.slice(0, 3),
        category: place.category,
      };

      await persist([nextMoment, ...moments]);
    },
    [moments, persist],
  );

  const value = useMemo(
    () => ({
      moments,
      isLoading,
      saveMoment,
    }),
    [moments, isLoading, saveMoment],
  );

  return <MomentsContext.Provider value={value}>{children}</MomentsContext.Provider>;
}

export function useMoments() {
  const context = useContext(MomentsContext);

  if (!context) {
    throw new Error('useMoments must be used within MomentsProvider');
  }

  return context;
}
