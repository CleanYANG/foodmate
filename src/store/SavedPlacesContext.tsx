import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Alert } from 'react-native';

import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import {
  fetchSavedPlaces,
  savePlace as savePlaceInService,
  unsavePlace,
} from '../services/placeService';
import { AuthRequiredError } from '../services/authService';

type SavedPlacesContextValue = {
  savedPlaceIds: string[];
  isLoading: boolean;
  errorMessage: string | null;
  savePlace: (placeId: string) => Promise<void>;
  removePlace: (placeId: string) => Promise<void>;
  isSaved: (placeId: string) => boolean;
  refreshSavedPlaces: () => Promise<void>;
  promptSignIn: () => void;
};

const SavedPlacesContext = createContext<SavedPlacesContextValue | undefined>(undefined);

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function SavedPlacesProvider({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const promptSignIn = useCallback(() => {
    Alert.alert(
      t('auth.prompt_title'),
      t('auth.prompt_body'),
    );
  }, [t]);

  const refreshSavedPlaces = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedPlaceIds([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const savedPlaces = await fetchSavedPlaces();
      setSavedPlaceIds(savedPlaces.map((savedPlace) => savedPlace.placeId));
    } catch (error) {
      setErrorMessage(toErrorMessage(error, t('common.error')));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, t]);

  useEffect(() => {
    void refreshSavedPlaces();
  }, [refreshSavedPlaces]);

  const savePlace = useCallback(
    async (placeId: string) => {
      if (!isAuthenticated) {
        promptSignIn();
        throw new AuthRequiredError();
      }

      const previousValue = savedPlaceIds;

      setSavedPlaceIds((currentValue) =>
        currentValue.includes(placeId) ? currentValue : [...currentValue, placeId],
      );
      setErrorMessage(null);

      try {
        await savePlaceInService(placeId);
      } catch (error) {
        setSavedPlaceIds(previousValue);
        setErrorMessage(toErrorMessage(error, t('common.error')));
        throw error;
      }
    },
    [isAuthenticated, promptSignIn, savedPlaceIds, t],
  );

  const removePlace = useCallback(
    async (placeId: string) => {
      if (!isAuthenticated) {
        promptSignIn();
        throw new AuthRequiredError();
      }

      const previousValue = savedPlaceIds;

      setSavedPlaceIds((currentValue) => currentValue.filter((savedId) => savedId !== placeId));
      setErrorMessage(null);

      try {
        await unsavePlace(placeId);
      } catch (error) {
        setSavedPlaceIds(previousValue);
        setErrorMessage(toErrorMessage(error, t('common.error')));
        throw error;
      }
    },
    [isAuthenticated, promptSignIn, savedPlaceIds, t],
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
      promptSignIn,
    }),
    [
      savedPlaceIds,
      isLoading,
      errorMessage,
      savePlace,
      removePlace,
      isSaved,
      refreshSavedPlaces,
      promptSignIn,
    ],
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
