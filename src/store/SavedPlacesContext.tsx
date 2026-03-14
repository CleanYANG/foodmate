import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type SavedPlacesContextValue = {
  savedPlaceIds: string[];
  savePlace: (placeId: string) => void;
  removePlace: (placeId: string) => void;
  isSaved: (placeId: string) => boolean;
};

const SavedPlacesContext = createContext<SavedPlacesContextValue | undefined>(undefined);

export function SavedPlacesProvider({ children }: PropsWithChildren) {
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);

  const savePlace = useCallback((placeId: string) => {
    setSavedPlaceIds((currentValue) => {
      if (currentValue.includes(placeId)) {
        return currentValue;
      }

      return [...currentValue, placeId];
    });
  }, []);

  const removePlace = useCallback((placeId: string) => {
    setSavedPlaceIds((currentValue) => currentValue.filter((savedId) => savedId !== placeId));
  }, []);

  const isSaved = useCallback(
    (placeId: string) => savedPlaceIds.includes(placeId),
    [savedPlaceIds],
  );

  const value = useMemo(
    () => ({
      savedPlaceIds,
      savePlace,
      removePlace,
      isSaved,
    }),
    [isSaved, removePlace, savePlace, savedPlaceIds],
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
