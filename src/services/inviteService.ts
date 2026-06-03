import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlacePostMode = 'share' | 'invite';
export type PlaceInviteStatus = 'idle' | 'requested' | 'accepted' | 'closed';

export type PlaceInviteMeta = {
  mode: PlacePostMode;
  creatorUserId: string | null;
  requesterUserId: string | null;
  acceptedRequesterUserId: string | null;
};

const STORAGE_KEY = 'savemeaseat.invites.v1';

type InviteMap = Record<string, PlaceInviteMeta>;

const defaultInviteMeta: PlaceInviteMeta = {
  mode: 'share',
  creatorUserId: null,
  requesterUserId: null,
  acceptedRequesterUserId: null,
};

async function readInviteMap(): Promise<InviteMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as InviteMap;
  } catch {
    return {};
  }
}

async function writeInviteMap(value: InviteMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export async function getPlaceInviteMeta(placeId: string): Promise<PlaceInviteMeta> {
  const map = await readInviteMap();
  return map[placeId] ?? defaultInviteMeta;
}

export async function getInviteMetaMap(placeIds: string[]): Promise<Record<string, PlaceInviteMeta>> {
  const map = await readInviteMap();
  return placeIds.reduce<Record<string, PlaceInviteMeta>>((accumulator, placeId) => {
    accumulator[placeId] = map[placeId] ?? defaultInviteMeta;
    return accumulator;
  }, {});
}

export async function registerPlaceInviteMeta(
  placeId: string,
  input: { mode: PlacePostMode; creatorUserId: string | null },
) {
  const map = await readInviteMap();
  map[placeId] = {
    mode: input.mode,
    creatorUserId: input.creatorUserId,
    requesterUserId: null,
    acceptedRequesterUserId: null,
  };
  await writeInviteMap(map);
}

export async function requestPlaceInvite(placeId: string, requesterUserId: string) {
  const map = await readInviteMap();
  const current = map[placeId] ?? defaultInviteMeta;

  if (current.mode !== 'invite') {
    throw new Error('This invite is closed.');
  }

  map[placeId] = {
    ...current,
    mode: 'invite',
    requesterUserId,
    acceptedRequesterUserId: current.acceptedRequesterUserId === requesterUserId ? requesterUserId : null,
  };
  await writeInviteMap(map);
}

export async function acceptPlaceInvite(placeId: string, creatorUserId: string) {
  const map = await readInviteMap();
  const current = map[placeId] ?? defaultInviteMeta;

  if (current.creatorUserId && current.creatorUserId !== creatorUserId) {
    throw new Error('Only the post creator can accept this invite.');
  }

  if (!current.requesterUserId) {
    throw new Error('No pending invite request.');
  }

  map[placeId] = {
    ...current,
    acceptedRequesterUserId: current.requesterUserId,
  };
  await writeInviteMap(map);
}

export async function closePlaceInvite(placeId: string, creatorUserId: string) {
  const map = await readInviteMap();
  const current = map[placeId] ?? defaultInviteMeta;

  if (current.creatorUserId && current.creatorUserId !== creatorUserId) {
    throw new Error('Only the post creator can close this invite.');
  }

  map[placeId] = {
    ...current,
    mode: 'share',
    requesterUserId: null,
    acceptedRequesterUserId: null,
  };
  await writeInviteMap(map);
}

export function deriveInviteStatus(meta: PlaceInviteMeta): PlaceInviteStatus {
  if (meta.mode !== 'invite') {
    return 'closed';
  }

  if (meta.acceptedRequesterUserId) {
    return 'accepted';
  }

  if (meta.requesterUserId) {
    return 'requested';
  }

  return 'idle';
}
