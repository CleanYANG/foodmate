import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  fetchSavedPlaces,
  savePlace as savePlaceInService,
  unsavePlace,
} from '../services/placeService';

type SavedPlacesContextValue = {
  savedPlaceIds: string[];
  isLoading: boolean;
  errorMessage: string | null;
  savePlace: (placeId: string) => Promise<void>;
  removePlace: (placeId: string) => Promise<void>;
  isSaved: (placeId: string) => boolean;
  refreshSavedPlaces: () => Promise<void>;
};

const SavedPlacesContext = createContext<SavedPlacesContextValue | undefined>(undefined);

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while syncing saved places.';
}

export function SavedPlacesProvider({ children }: PropsWithChildren) {
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshSavedPlaces = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const savedPlaces = await fetchSavedPlaces();
      setSavedPlaceIds(savedPlaces.map((savedPlace) => savedPlace.placeId));
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSavedPlaces();
  }, [refreshSavedPlaces]);

  const savePlace = useCallback(
    async (placeId: string) => {
      const previousValue = savedPlaceIds;

      setSavedPlaceIds((currentValue) =>
        currentValue.includes(placeId) ? currentValue : [...currentValue, placeId],
      );
      setErrorMessage(null);

      try {
        await savePlaceInService(placeId);
      } catch (error) {
        setSavedPlaceIds(previousValue);
        setErrorMessage(toErrorMessage(error));
        throw error;
      }
    },
    [savedPlaceIds],
  );

  const removePlace = useCallback(
    async (placeId: string) => {
      const previousValue = savedPlaceIds;

      setSavedPlaceIds((currentValue) => currentValue.filter((savedId) => savedId !== placeId));
      setErrorMessage(null);

      try {
        await unsavePlace(placeId);
      } catch (error) {
        setSavedPlaceIds(previousValue);
        setErrorMessage(toErrorMessage(error));
        throw error;
      }
    },
    [savedPlaceIds],
  );

  const isSaved = useCallback(
    (placeId: string) => savedPlaceIds.includes(placeId),
    [savedPlaceIds],
  );

  const value = useMemo(
    () => ({
      savedPlaceIds,
      isLoading,
      errorMessage,
      savePlace,
      removePlace,
      isSaved,
      refreshSavedPlaces,
    }),
    [savedPlaceIds, isLoading, errorMessage, savePlace, removePlace, isSaved, refreshSavedPlaces],
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
