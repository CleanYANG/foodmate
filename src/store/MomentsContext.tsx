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

const mockMoments: Moment[] = [
  {
    id: 'moment-001',
    userId: 'local-user',
    placeId: 'place-001',
    city: 'Sapporo',
    placeName: 'Snow Lantern Coffee',
    placeImageUrl: 'https://placehold.co/800x1200?text=Snow+Lantern+Coffee',
    userImageUrl: null,
    text: '很安静…',
    createdAt: '2026-03-27T09:00:00.000Z',
    vibeTags: ['cozy', 'quiet', 'coffee'],
    category: 'cafe',
  },
  {
    id: 'moment-002',
    userId: 'local-user',
    placeId: 'place-013',
    city: 'Sapporo',
    placeName: 'Birch Path Tea Room',
    placeImageUrl: 'https://placehold.co/800x1200?text=Birch+Path+Tea+Room',
    userImageUrl: null,
    text: 'Snow outside, warm cup, no rush.',
    createdAt: '2026-03-25T10:15:00.000Z',
    vibeTags: ['tea', 'quiet escape'],
    category: 'cafe',
  },
  {
    id: 'moment-003',
    userId: 'local-user',
    placeId: 'place-016',
    city: 'Sapporo',
    placeName: 'Velvet Snow Cocktail Room',
    placeImageUrl: 'https://placehold.co/800x1200?text=Velvet+Snow+Cocktail+Room',
    userImageUrl: null,
    text: 'Felt like the city slowed down for one drink.',
    createdAt: '2026-03-23T12:40:00.000Z',
    vibeTags: ['intimate', 'evening'],
    category: 'bar',
  },
];

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
        setMoments(rawValue ? (JSON.parse(rawValue) as Moment[]) : mockMoments);
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
        placeImageUrl: place.imageUrl,
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
