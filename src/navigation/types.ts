export type RootStackParamList = {
  Home: undefined;
  PlaceDetail: { placeId?: string } | undefined;
  Chat: { placeId?: string; initialMessage?: string } | undefined;
  MyMoment: undefined;
  SavedPlaces: undefined;
  Profile: undefined;
  Settings: undefined;
  SignIn: undefined;
};
