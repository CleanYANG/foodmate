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

const STORAGE_KEY = 'citytalk.savedPlaceIds';

type SavedPlacesContextValue = {
  savedPlaceIds: string[];
  isReady: boolean;
  savePlace: (placeId: string) => Promise<void>;
  removePlace: (placeId: string) => Promise<void>;
  isSaved: (placeId: string) => boolean;
};

const SavedPlacesContext = createContext<SavedPlacesContextValue | undefined>(undefined);

export function SavedPlacesProvider({ children }: PropsWithChildren) {
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadSavedPlaceIds() {
      try {
        const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

        if (rawValue) {
          const parsedValue = JSON.parse(rawValue) as string[];
          setSavedPlaceIds(Array.isArray(parsedValue) ? parsedValue : []);
        }
      } catch (error) {
        console.warn('Failed to load saved places', error);
      } finally {
        setIsReady(true);
      }
    }

    void loadSavedPlaceIds();
  }, []);

  const persist = useCallback(async (nextValue: string[]) => {
    setSavedPlaceIds(nextValue);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
  }, []);

  const savePlace = useCallback(
    async (placeId: string) => {
      if (savedPlaceIds.includes(placeId)) {
        return;
      }

      const nextValue = [...savedPlaceIds, placeId];
      await persist(nextValue);
    },
    [persist, savedPlaceIds],
  );

  const removePlace = useCallback(
    async (placeId: string) => {
      const nextValue = savedPlaceIds.filter((savedId) => savedId !== placeId);
      await persist(nextValue);
    },
    [persist, savedPlaceIds],
  );

  const isSaved = useCallback(
    (placeId: string) => savedPlaceIds.includes(placeId),
    [savedPlaceIds],
  );

  const value = useMemo(
    () => ({
      savedPlaceIds,
      isReady,
      savePlace,
      removePlace,
      isSaved,
    }),
    [isReady, isSaved, removePlace, savePlace, savedPlaceIds],
  );

  return <SavedPlacesContext.Provider value={value}>{children}</SavedPlacesContext.Provider>;
}

export function useSavedPlaces() {
  const context = useContext(SavedPlacesContext);

  if (!context) {
    throw new Error('useSavedPlaces must be used within SavedPlacesProvider');
  }

  return context;
}
