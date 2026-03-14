export type PlaceCategory =
  | 'cafe'
  | 'bar'
  | 'market'
  | 'local food'
  | 'date spot'
  | 'hidden gem'
  | 'sightseeing';

export type MockPlace = {
  id: string;
  name: string;
  shortReview: string;
  fullDescription: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  tags: string[];
  category: PlaceCategory;
};

export const mockPlaces: MockPlace[] = [
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
    imageUrl: 'https://placehold.co/800x1200?text=Snow+Lantern+Coffee',
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
      'A lively indoor market with seafood bowls, produce stalls, and plenty to snack on while browsing.',
    fullDescription:
      'Sora Street Market Hall offers the kind of easy, visual food discovery that makes a city feel alive. The aisles are packed with regional specialties, quick bites, and vendors who clearly care about what they sell. It is a fun choice for groups who want to sample a little of everything without committing to one restaurant.',
    address: '1-7 Kita 11 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0688,
    longitude: 141.3462,
    imageUrl: 'https://placehold.co/800x1200?text=Sora+Street+Market+Hall',
    tags: ['seafood', 'market stroll', 'casual', 'local produce'],
    category: 'market',
  },
  {
    id: 'place-004',
    name: 'Miso Corner Shokudo',
    shortReview:
      'Rich ramen, fast service, and exactly the kind of comforting meal you want on a cold day.',
    fullDescription:
      'Miso Corner Shokudo keeps things straightforward: hearty bowls, deep flavor, and a steady stream of hungry regulars. It is not trying to be precious, which is part of the charm. If you want something dependable, warm, and very Sapporo, this is an easy recommendation.',
    address: '3-2-14 Kita 5 Johigashi, Chuo-ku, Sapporo',
    latitude: 43.0665,
    longitude: 141.3581,
    imageUrl: 'https://placehold.co/800x1200?text=Miso+Corner+Shokudo',
    tags: ['ramen', 'comfort food', 'quick meal', 'local classic'],
    category: 'local food',
  },
  {
    id: 'place-005',
    name: 'Moondrop Terrace',
    shortReview:
      'A softly lit upper-floor restaurant with city views and a date-night atmosphere that feels easy, not stiff.',
    fullDescription:
      'Moondrop Terrace is designed for evenings that are meant to feel a little special. The lighting is flattering, the seating is spaced well, and the mood works whether you are on a first date or just want a slower dinner with someone you like. The view over the city adds just enough drama without overwhelming the meal.',
    address: '8-1-5 Minami 2 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0577,
    longitude: 141.3475,
    imageUrl: 'https://placehold.co/800x1200?text=Moondrop+Terrace',
    tags: ['romantic', 'city view', 'dinner', 'stylish'],
    category: 'date spot',
  },
  {
    id: 'place-006',
    name: 'Maple Lane Bakehouse',
    shortReview:
      'A tiny bakery-café with buttery pastries and a neighborhood vibe that feels instantly welcoming.',
    fullDescription:
      'Maple Lane Bakehouse is easy to miss from the street, but that is part of why people remember it. The display case leans seasonal, the coffee is solid, and there is a calm rhythm to the room that makes you want to linger. It is especially good for travelers looking for a softer, more residential side of Sapporo.',
    address: '4-6-3 Maruyama Nishi-machi, Chuo-ku, Sapporo',
    latitude: 43.0555,
    longitude: 141.3148,
    imageUrl: 'https://placehold.co/800x1200?text=Maple+Lane+Bakehouse',
    tags: ['pastries', 'neighborhood', 'hidden spot', 'morning'],
    category: 'hidden gem',
  },
  {
    id: 'place-007',
    name: 'Clock Tower Garden Walk',
    shortReview:
      'A classic sightseeing stop with a calmer surrounding area than expected and nice photo angles nearby.',
    fullDescription:
      'Clock Tower Garden Walk is a good example of a sightseeing spot that works best when treated as part of a wider stroll. The landmark itself is familiar, but the nearby blocks offer pockets of greenery, benches, and low-key city views. It is a great anchor point if you want an easy, low-stress introduction to central Sapporo.',
    address: '2-1 Kita 1 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0621,
    longitude: 141.3534,
    imageUrl: 'https://placehold.co/800x1200?text=Clock+Tower+Garden+Walk',
    tags: ['iconic', 'photos', 'walking route', 'central'],
    category: 'sightseeing',
  },
  {
    id: 'place-008',
    name: 'River Snow Espresso',
    shortReview:
      'Bright espresso drinks, minimalist design, and a riverside location that feels fresh and modern.',
    fullDescription:
      'River Snow Espresso has a more design-forward mood than many classic coffee spots in the city, but it still feels welcoming. The drinks are clean and balanced, and the seating works for a quick stop or a laptop session. It is a strong pick for people who like modern cafés with a calm visual identity.',
    address: '7-2-18 Nakajima Koen, Chuo-ku, Sapporo',
    latitude: 43.0447,
    longitude: 141.3544,
    imageUrl: 'https://placehold.co/800x1200?text=River+Snow+Espresso',
    tags: ['modern', 'espresso', 'riverside', 'minimal'],
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
    name: 'Hokkaido Pantry Lane',
    shortReview:
      'A polished local market with cheese, sweets, and giftable food that does not feel overly touristy.',
    fullDescription:
      'Hokkaido Pantry Lane is ideal when you want regional food in one easy loop. The selection covers sweet and savory specialties, and there is enough variety to make souvenir shopping actually enjoyable. It feels curated rather than crowded, which makes it especially useful for short-stay visitors.',
    address: '1-1 Kita 6 Jonishi, Kita-ku, Sapporo',
    latitude: 43.0681,
    longitude: 141.3506,
    imageUrl: 'https://placehold.co/800x1200?text=Hokkaido+Pantry+Lane',
    tags: ['souvenirs', 'snacks', 'regional foods', 'easy shopping'],
    category: 'market',
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
    imageUrl: 'https://placehold.co/800x1200?text=Steam+Pot+Soup+Curry',
    tags: ['soup curry', 'spicy', 'vegetables', 'local favorite'],
    category: 'local food',
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
    imageUrl: 'https://placehold.co/800x1200?text=Aurora+Window+Dining',
    tags: ['date night', 'quiet', 'views', 'modern dining'],
    category: 'date spot',
  },
  {
    id: 'place-013',
    name: 'Birch Path Tea Room',
    shortReview:
      'A hidden second-floor tea room with handmade desserts and a wonderfully unhurried pace.',
    fullDescription:
      'Birch Path Tea Room feels like it exists slightly outside the tempo of the city. The menu favors classic tea service, the desserts are delicate without being fussy, and the whole place invites you to slow down. It is a strong choice for travelers who want a break from busy attractions and louder food halls.',
    address: '5-9-7 Minami 3 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0566,
    longitude: 141.3503,
    imageUrl: 'https://placehold.co/800x1200?text=Birch+Path+Tea+Room',
    tags: ['tea', 'desserts', 'quiet escape', 'second floor'],
    category: 'hidden gem',
  },
  {
    id: 'place-014',
    name: 'Hillview Observation Deck',
    shortReview:
      'An easy scenic stop with wide city views, especially striking around sunset and after dark.',
    fullDescription:
      'Hillview Observation Deck gives you the kind of panoramic payoff that helps orient the whole city at once. The route up is simple, the platform is comfortable to linger on, and the changing light makes repeat visits worth considering. It is especially memorable for couples and photographers chasing evening color.',
    address: '1-1 Fushimi, Chuo-ku, Sapporo',
    latitude: 43.0405,
    longitude: 141.3212,
    imageUrl: 'https://placehold.co/800x1200?text=Hillview+Observation+Deck',
    tags: ['sunset', 'panoramic', 'photos', 'viewpoint'],
    category: 'sightseeing',
  },
  {
    id: 'place-015',
    name: 'Spruce & Stone Café',
    shortReview:
      'Warm woods, excellent cheesecake, and a mellow soundtrack that makes staying longer feel reasonable.',
    fullDescription:
      'Spruce & Stone Café balances comfort and style very well. The desserts are genuinely worth ordering, the seating is comfortable, and the room has that clean but lived-in atmosphere many visitors look for. It works for solo coffee breaks, casual meetings, or a slower afternoon recharge.',
    address: '12-2-6 Kita 3 Jonishi, Chuo-ku, Sapporo',
    latitude: 43.0637,
    longitude: 141.3391,
    imageUrl: 'https://placehold.co/800x1200?text=Spruce+%26+Stone+Cafe',
    tags: ['cheesecake', 'design', 'coffee break', 'comfortable'],
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
    name: 'Morning Crab Arcade',
    shortReview:
      'A seafood-forward market corridor that feels energetic early in the day and rewards hungry wandering.',
    fullDescription:
      'Morning Crab Arcade is one of those places where appetite makes every decision easier. The market has enough movement to feel exciting, but it is laid out clearly enough that newcomers will not feel lost. Come early, bring curiosity, and expect to leave with both a meal and a few snack ideas for later.',
    address: '2-3-15 Nijo Market, Chuo-ku, Sapporo',
    latitude: 43.0581,
    longitude: 141.3574,
    imageUrl: 'https://placehold.co/800x1200?text=Morning+Crab+Arcade',
    tags: ['seafood', 'morning', 'food crawl', 'busy'],
    category: 'market',
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
    imageUrl: 'https://placehold.co/800x1200?text=Charcoal+Alley+Jingisukan',
    tags: ['jingisukan', 'grill', 'group dinner', 'local specialty'],
    category: 'local food',
  },
  {
    id: 'place-019',
    name: 'Secret Garden Footpath',
    shortReview:
      'A quiet walking route lined with small trees and benches, ideal for a low-key detour from busier areas.',
    fullDescription:
      'Secret Garden Footpath is less about a major landmark and more about atmosphere. The route feels tucked away, the pace is slow, and the little details make it pleasant: soft lighting, seasonal plants, and enough seating to encourage a pause. It is a nice option when you want a scenic break without committing to a major attraction.',
    address: '6-1-2 Asahigaoka, Chuo-ku, Sapporo',
    latitude: 43.0369,
    longitude: 141.3304,
    imageUrl: 'https://placehold.co/800x1200?text=Secret+Garden+Footpath',
    tags: ['quiet walk', 'greenery', 'romantic', 'detour'],
    category: 'hidden gem',
  },
  {
    id: 'place-020',
    name: 'Snowcap Park Lookout',
    shortReview:
      'A spacious park viewpoint with open skies and enough room to make even busy days feel breathable.',
    fullDescription:
      'Snowcap Park Lookout offers a more relaxed sightseeing experience than tightly packed tourist stops. The open space gives families and couples room to move, and the elevated views make it easy to appreciate the wider shape of Sapporo. It is especially pleasant in clear weather when the horizon feels extra wide.',
    address: '1-17 Moiwa, Minami-ku, Sapporo',
    latitude: 43.0284,
    longitude: 141.3412,
    imageUrl: 'https://placehold.co/800x1200?text=Snowcap+Park+Lookout',
    tags: ['park', 'view', 'family friendly', 'open air'],
    category: 'sightseeing',
  },
];
