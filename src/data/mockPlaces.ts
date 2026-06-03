import type { ImageSourcePropType } from 'react-native';

import type { PlaceRecommender } from '../types/place';

import cafe1 from '../../assets/cafe/札幌 -allee cafe.jpg';
import cafe2 from '../../assets/cafe/札幌-Shizukuya.jpg';
import cafe3 from '../../assets/cafe/札幌-aile cafe.jpg';
import cafe4 from '../../assets/cafe/札幌-cafe-Noymond.jpg';
import cafe5 from '../../assets/cafe/札幌-patisserie Cafe feve-1.jpg';
import cafe6 from '../../assets/cafe/札幌-patisserie Cafe feve-2.jpg';
import restaurant1 from '../../assets/cafe/札幌-patisserie Cafe feve-3.jpeg';
import restaurant2 from '../../assets/cafe/札幌-trattoria KUJIRA sapporo-1.jpg';
import restaurant3 from '../../assets/cafe/札幌-aile cafe.jpg';
import restaurant4 from '../../assets/cafe/札幌-trattoria KUJIRA sapporo-2.jpg';
import restaurant5 from '../../assets/cafe/札幌-一粒の麦.jpg';

export type PlaceCategory = 'restaurant' | 'cafe' | 'bar' | 'on_mars';

export type MockPlace = {
  id: string;
  name: string;
  shortReview: string;
  fullDescription: string;
  story: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl: string | ImageSourcePropType;
  imageUrls: Array<string | ImageSourcePropType>;
  tags: string[];
  category: PlaceCategory;
  recommender: PlaceRecommender;
  budget: string | null;
  bestFor: string[];
};

const recommenderPool: PlaceRecommender[] = [
  {
    name: 'Yuki',
    avatar: null,
    shortBio: '喜欢安静咖啡馆和下雪天散步',
    intent: '想找一个也喜欢慢咖啡的人',
    quote: '下雪天坐窗边真的很舒服，想找人一起去。',
  },
  {
    name: 'Mina',
    avatar: null,
    shortBio: '偏爱小店、热汤和慢慢聊天',
    intent: '最近想认识愿意一起认真吃饭的人',
    quote: '如果你也喜欢边吃边聊天，这家会很适合第一次见面。',
  },
  {
    name: 'Ren',
    avatar: null,
    shortBio: '会为了夜宵和一杯酒专门绕路',
    intent: '想找下班后可以随时约饭的人',
    quote: '不会太正式，点几样一起吃就很自然。',
  },
  {
    name: 'Aki',
    avatar: null,
    shortBio: '喜欢街边小吃和临时起意的散步',
    intent: '想认识也愿意边走边吃的人',
    quote: '不是打卡感，是那种路过就会想一起停下来吃的地方。',
  },
];

function buildBudget(category: PlaceCategory) {
  if (category === 'bar') {
    return '¥1500-3000';
  }

  if (category === 'restaurant') {
    return '¥1000-2500';
  }

  if (category === 'on_mars') {
    return '¥500-1200';
  }

  return '¥800-1500';
}

function buildBestFor(category: PlaceCategory, tags: string[]) {
  const defaults =
    category === 'bar'
      ? ['下班小酌', '第一次见面', '慢慢聊天']
      : category === 'restaurant'
        ? ['认真吃饭', '第一次见面', '分享食物']
        : category === 'on_mars'
          ? ['边走边吃', '轻松约一下', '随手加一站']
          : ['安静聊天', '慢一点坐着', '一个人也舒服'];

  return [...defaults, ...tags.slice(0, 1)];
}

function buildStory(placeName: string, review: string, description: string, recommender: PlaceRecommender) {
  return `${placeName} 是我最近很想再约人一起去的一家。${review} ${description} 如果你也会因为食物和氛围想认识一个人，我们可以先从这里开始。`;
}

const coffeeOptionImages = [
  cafe1,
  cafe2,
  cafe3,
  cafe4,
  cafe5,
  cafe6,
  restaurant1,
  restaurant2,
  restaurant3,
  restaurant4,
  restaurant5,
] as const;

const cafePlaceIds = ['place-001', 'place-006', 'place-008', 'place-013', 'place-015', 'place-020'];

const cafeImageByPlaceId: Partial<Record<string, string | ImageSourcePropType>> =
  cafePlaceIds.reduce(
    (accumulator, placeId, index) => {
      accumulator[placeId] = coffeeOptionImages[index % coffeeOptionImages.length];
      return accumulator;
    },
    {} as Partial<Record<string, string | ImageSourcePropType>>,
  );

function getMockImage(placeId: string, fallbackUrl: string) {
  return cafeImageByPlaceId[placeId] ?? fallbackUrl;
}

function buildMockGallery(primaryImage: string | ImageSourcePropType, seed: number) {
  const gallery = [primaryImage];

  for (let index = 0; index < coffeeOptionImages.length && gallery.length < 5; index += 1) {
    const candidate = coffeeOptionImages[(seed + index) % coffeeOptionImages.length];

    if (!gallery.includes(candidate)) {
      gallery.push(candidate);
    }
  }

  return gallery.slice(0, 5);
}

const baseMockPlaces: Array<
  Omit<MockPlace, 'story' | 'recommender' | 'budget' | 'bestFor'>
> = [
  {
    id: 'place-001',
    name: 'Snow Lantern Coffee',
    shortReview:
      'A calm café with soft jazz, creamy lattes, and a window view that makes snowy mornings feel cinematic.',
    fullDescription:
      'Snow Lantern Coffee is the kind of place travelers hope to stumble into on their first walk through Sapporo. The room is quiet, the wood interior feels warm even in deep winter, and the drinks lean smooth rather than flashy. It is a great stop for slow mornings, journaling, or a break between sightseeing spots in the city center.',
    address: '2-4-8 Odorinishi, Chuo-ku, Sapporo',
    latitude: 43.0609,
    longitude: 141.3488,
    imageUrl: getMockImage('place-001', 'https://placehold.co/800x1200?text=Snow+Lantern+Coffee'),
    tags: ['cozy', 'quiet', 'coffee', 'winter view'],
    category: 'cafe',
  },
  {
    id: 'place-002',
    name: 'North Alley Highball',
    shortReview:
      'A compact late-night bar with friendly staff, crisp highballs, and a relaxed local crowd.',
    fullDescription:
      'North Alley Highball feels tucked away in the best way. The menu is simple, the drinks are consistent, and the atmosphere lands somewhere between stylish and approachable. It works well as a low-pressure first stop in Susukino or a final drink before heading back to the hotel.',
    address: '5-3-11 Minami 5 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0544,
    longitude: 141.3537,
    imageUrl: 'https://placehold.co/800x1200?text=North+Alley+Highball',
    tags: ['nightlife', 'highball', 'locals', 'small bar'],
    category: 'bar',
  },
  {
    id: 'place-003',
    name: 'Sora Street Market Hall',
    shortReview:
      'A lively, semi-mobile food hub with seafood bowls, produce stalls, and quick bites worth chasing down.',
    fullDescription:
      'Sora Street Market Hall is set up like a flexible vendor cluster rather than a conventional permanent spot. The mix of pop-up counters, casual browsing, and street-food energy makes it feel lively and easy to explore. It is a fun choice when you want something more spontaneous than a standard sit-down meal.',
    address: '1-7 Kita 11 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0688,
    longitude: 141.3462,
    imageUrl: 'https://placehold.co/800x1200?text=Sora+Street+Market+Hall',
    tags: ['seafood', 'street food', 'casual', 'local produce'],
    category: 'on_mars',
  },
  {
    id: 'place-004',
    name: 'Hitotsubu no Mugi',
    shortReview:
      'A warm little spot with a gentle, homey mood and the kind of desserts that make you slow down.',
    fullDescription:
      'Hitotsubu no Mugi feels thoughtful and quietly comforting. The space has a soft, intimate atmosphere, and it works best when you want a calm stop rather than a rushed coffee break. It is easy to picture lingering here with dessert and an unhurried conversation.',
    address: '3-2-14 Kita 5 Johigashi, Chuo-ku, Sapporo',
    latitude: 43.0665,
    longitude: 141.3581,
    imageUrl: restaurant5,
    tags: ['desserts', 'quiet', 'cozy', 'gentle atmosphere'],
    category: 'cafe',
  },
  {
    id: 'place-005',
    name: 'trattoria KUJIRA sapporo',
    shortReview:
      'A relaxed trattoria with a friendly tone, generous plates, and a casual date-night feel.',
    fullDescription:
      'trattoria KUJIRA sapporo feels polished without becoming formal. The room has a comfortable warmth, and the atmosphere is easy to settle into even on a first visit. It is a good pick when you want somewhere that feels a little special but still very approachable.',
    address: '8-1-5 Minami 2 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0577,
    longitude: 141.3475,
    imageUrl: restaurant2,
    tags: ['trattoria', 'casual dinner', 'stylish', 'easy date spot'],
    category: 'restaurant',
  },
  {
    id: 'place-006',
    name: 'patisserie Cafe feve',
    shortReview:
      'A charming patisserie café with delicate sweets and a calm, polished atmosphere.',
    fullDescription:
      'patisserie Cafe feve feels neat, pretty, and quietly inviting. It is the kind of place that works well for an afternoon pause, especially if you want something a little more elegant than a standard coffee stop. The overall mood is soft and easy, with desserts that feel like the main reason to visit.',
    address: '4-6-3 Maruyama Nishi-machi, Chuo-ku, Sapporo',
    latitude: 43.0555,
    longitude: 141.3148,
    imageUrl: cafe5,
    tags: ['patisserie', 'desserts', 'calm', 'afternoon cafe'],
    category: 'cafe',
  },
  {
    id: 'place-007',
    name: 'Clock Tower Garden Walk Cart',
    shortReview:
      'A pop-up snack cart near a classic sightseeing area with quick treats and a fun passing crowd.',
    fullDescription:
      'Clock Tower Garden Walk Cart works as a lightweight stop when you want something snackable while moving through the city. It changes position and menu often enough to feel flexible, and the casual grab-and-go setup makes it more playful than a fixed location.',
    address: '2-1 Kita 1 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0621,
    longitude: 141.3534,
    imageUrl: 'https://placehold.co/800x1200?text=Clock+Tower+Garden+Walk+Cart',
    tags: ['pop-up', 'photos', 'walking route', 'quick bite'],
    category: 'on_mars',
  },
  {
    id: 'place-008',
    name: 'allee cafe',
    shortReview:
      'A cozy café with a relaxed rhythm, warm light, and an easy everyday charm.',
    fullDescription:
      'allee cafe feels comfortable in a very natural way. Nothing about it tries too hard, which makes the atmosphere especially pleasant for a slow catch-up or a quiet solo break. It gives off a familiar, lived-in warmth that makes staying longer feel effortless.',
    address: '7-2-18 Nakajima Koen, Chuo-ku, Sapporo',
    latitude: 43.0447,
    longitude: 141.3544,
    imageUrl: cafe1,
    tags: ['cozy', 'relaxed', 'warm light', 'slow coffee'],
    category: 'cafe',
  },
  {
    id: 'place-009',
    name: 'Lantern Fox Izakaya',
    shortReview:
      'Bustling but friendly, with charcoal skewers and enough energy to make dinner feel like an event.',
    fullDescription:
      'Lantern Fox Izakaya is lively without crossing into chaos. The room fills quickly, the grilled dishes come out fast, and the atmosphere rewards people who want to lean into the social side of the city. It is a good place to share plates, try a few drinks, and get a more animated evening experience.',
    address: '6-4-2 Minami 4 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0557,
    longitude: 141.3518,
    imageUrl: 'https://placehold.co/800x1200?text=Lantern+Fox+Izakaya',
    tags: ['izakaya', 'shared plates', 'charcoal grill', 'energetic'],
    category: 'bar',
  },
  {
    id: 'place-010',
    name: 'Hokkaido Pantry Wagon',
    shortReview: 'A movable local-food wagon with giftable snacks and a casual drop-in feel.',
    fullDescription:
      'Hokkaido Pantry Wagon is more nimble than a full market and more interesting than a fixed kiosk. The selection changes, the format is quick, and it works well for spontaneous grazing or grabbing something regional without committing to a full sit-down stop.',
    address: '1-1 Kita 6 Jonishi, Kita-ku, Sapporo',
    latitude: 43.0681,
    longitude: 141.3506,
    imageUrl: 'https://placehold.co/800x1200?text=Hokkaido+Pantry+Wagon',
    tags: ['souvenirs', 'snacks', 'street food', 'easy shopping'],
    category: 'on_mars',
  },
  {
    id: 'place-011',
    name: 'Steam Pot Soup Curry',
    shortReview:
      'Flavorful soup curry with tender vegetables and a spice level that is satisfying without being punishing.',
    fullDescription:
      'Steam Pot Soup Curry serves a version of one of Sapporo’s signature dishes that feels generous and well-balanced. The broth has depth, the toppings are thoughtfully cooked, and the menu is friendly to both first-timers and regular fans. It is a reliable recommendation when you want a local specialty that still feels accessible.',
    address: '9-3-22 Minami 1 Johigashi, Chuo-ku, Sapporo',
    latitude: 43.0588,
    longitude: 141.3645,
    imageUrl: getMockImage('place-011', 'https://placehold.co/800x1200?text=Steam+Pot+Soup+Curry'),
    tags: ['soup curry', 'spicy', 'vegetables', 'local favorite'],
    category: 'restaurant',
  },
  {
    id: 'place-012',
    name: 'Aurora Window Dining',
    shortReview:
      'A sleek restaurant with candlelit tables and enough quiet to make conversation feel effortless.',
    fullDescription:
      'Aurora Window Dining is built around atmosphere. The seating faces large windows, the music stays low, and the pacing makes it easy to settle into the evening. It is not flashy, which actually makes it more romantic. People who want a relaxed but polished date-night option will probably feel comfortable here.',
    address: '3-5-19 Odorinishi, Chuo-ku, Sapporo',
    latitude: 43.0603,
    longitude: 141.3446,
    imageUrl: getMockImage('place-012', 'https://placehold.co/800x1200?text=Aurora+Window+Dining'),
    tags: ['date night', 'quiet', 'views', 'modern dining'],
    category: 'restaurant',
  },
  {
    id: 'place-013',
    name: 'Shizukuya',
    shortReview: 'A quiet, understated café with a peaceful mood that feels especially good on slower days.',
    fullDescription:
      'Shizukuya has a soft, settled atmosphere that makes it easy to pause for a while. The space feels simple and intentional, with a calmness that stands out from busier coffee shops. It is a nice option when you want something low-key, gentle, and quietly memorable.',
    address: '5-9-7 Minami 3 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0566,
    longitude: 141.3503,
    imageUrl: cafe2,
    tags: ['quiet escape', 'minimal', 'peaceful', 'soft atmosphere'],
    category: 'cafe',
  },
  {
    id: 'place-014',
    name: 'Hillview Sunset Truck',
    shortReview: 'A temporary food truck stop with sunset views and an easygoing evening mood.',
    fullDescription:
      'Hillview Sunset Truck is exactly the sort of movable food stop that feels worth detouring for. The setup is casual, the menu is flexible, and the combination of views and quick service gives it a memorable, one-off feel.',
    address: '1-1 Fushimi, Chuo-ku, Sapporo',
    latitude: 43.0405,
    longitude: 141.3212,
    imageUrl: 'https://placehold.co/800x1200?text=Hillview+Sunset+Truck',
    tags: ['sunset', 'street vendor', 'photos', 'viewpoint'],
    category: 'on_mars',
  },
  {
    id: 'place-015',
    name: 'aile cafe',
    shortReview:
      'A bright and friendly café with a clean look and an easy, welcoming energy.',
    fullDescription:
      'aile cafe feels light, open, and approachable from the moment you walk in. It has a casual comfort that suits both a simple coffee break and a longer conversation. The overall vibe is cheerful without being loud, which makes it an easy place to recommend to almost anyone.',
    address: '12-2-6 Kita 3 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0637,
    longitude: 141.3391,
    imageUrl: cafe3,
    tags: ['bright', 'friendly', 'casual', 'easy conversation'],
    category: 'cafe',
  },
  {
    id: 'place-016',
    name: 'Velvet Snow Cocktail Room',
    shortReview:
      'A polished cocktail bar with low lighting, thoughtful drinks, and a more intimate mood than the average nightlife stop.',
    fullDescription:
      'Velvet Snow Cocktail Room is best for nights when you want something quieter and more refined than a crowded bar street. The bartenders know what they are doing, the menu has enough variety without being overwhelming, and the room feels curated in a way that supports conversation. It is an easy recommendation for couples or small groups.',
    address: '4-7-10 Minami 6 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0532,
    longitude: 141.3507,
    imageUrl: 'https://placehold.co/800x1200?text=Velvet+Snow+Cocktail+Room',
    tags: ['cocktails', 'intimate', 'stylish', 'evening'],
    category: 'bar',
  },
  {
    id: 'place-017',
    name: 'Morning Crab Arcade Cart',
    shortReview: 'A seafood-forward roaming cart that rewards hungry early wandering.',
    fullDescription:
      'Morning Crab Arcade Cart brings a market-like food crawl energy into a more lightweight, movable format. It is ideal when you want something fast, local, and slightly playful rather than a fixed sit-down stop.',
    address: '2-3-15 Nijo Market, Chuo-ku, Sapporo',
    latitude: 43.0581,
    longitude: 141.3574,
    imageUrl: 'https://placehold.co/800x1200?text=Morning+Crab+Arcade+Cart',
    tags: ['seafood', 'morning', 'food crawl', 'busy'],
    category: 'on_mars',
  },
  {
    id: 'place-018',
    name: 'Charcoal Alley Jingisukan',
    shortReview:
      'Smoky, lively, and exactly the kind of hands-on meal that makes dinner feel memorable.',
    fullDescription:
      'Charcoal Alley Jingisukan leans into the fun of cooking and eating around the grill. The lamb is tender, the portions are friendly for sharing, and the atmosphere has the right amount of messiness for an authentic-feeling meal. It is especially good for visitors who want a distinct local food experience beyond ramen.',
    address: '7-8-4 Kita 7 Jonishi, Kita-ku, Sapporo',
    latitude: 43.0706,
    longitude: 141.3419,
    imageUrl: getMockImage(
      'place-018',
      'https://placehold.co/800x1200?text=Charcoal+Alley+Jingisukan',
    ),
    tags: ['jingisukan', 'grill', 'group dinner', 'local specialty'],
    category: 'restaurant',
  },
  {
    id: 'place-019',
    name: 'Secret Garden Coffee Stand',
    shortReview: 'A tiny movable coffee stand tucked near a quiet walking route.',
    fullDescription:
      'Secret Garden Coffee Stand is one of those unusual little stops that feels discovered rather than marketed. The setup is minimal, the drinks are quick, and the mood is shaped by wherever it happens to land that day.',
    address: '6-1-2 Asahigaoka, Chuo-ku, Sapporo',
    latitude: 43.0369,
    longitude: 141.3304,
    imageUrl: 'https://placehold.co/800x1200?text=Secret+Garden+Coffee+Stand',
    tags: ['quiet walk', 'street vendor', 'detour', 'coffee'],
    category: 'on_mars',
  },
  {
    id: 'place-020',
    name: 'cafe Noymond',
    shortReview: 'A stylish café with a calm edge, good natural light, and a quietly modern atmosphere.',
    fullDescription:
      'cafe Noymond has a clean, contemporary feel without turning cold. The room looks thoughtfully put together, but it still feels easy to relax in. It is a strong pick for people who like cafés with a modern visual mood and a softer, more reflective pace.',
    address: '1-17 Moiwa, Minami-ku, Sapporo',
    latitude: 43.0284,
    longitude: 141.3412,
    imageUrl: cafe4,
    tags: ['modern', 'natural light', 'stylish', 'calm'],
    category: 'cafe',
  },
];

export const mockPlaces: MockPlace[] = baseMockPlaces.map((place, index) => {
  const recommender = recommenderPool[index % recommenderPool.length];
  const imageUrls = buildMockGallery(place.imageUrl, index);

  return {
    ...place,
    imageUrl: imageUrls[0],
    imageUrls,
    recommender,
    story: buildStory(place.name, place.shortReview, place.fullDescription, recommender),
    budget: buildBudget(place.category),
    bestFor: buildBestFor(place.category, place.tags),
  };
});
