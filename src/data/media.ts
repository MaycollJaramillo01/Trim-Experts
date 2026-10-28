import type { ImageMetadata } from 'astro';

// Photos published on the Trim Experts Yelp profile (inventory: Trim_Experts/fotos_fuentes.json),
// plus photos sent directly by the client (n >= 33, no `yelp` id).
// `n` is the original file number, `yelp` the Yelp photo id. Descriptions state only what is visible:
// no locations, materials or before/after pairings are claimed.
type Stage = 'completed' | 'in-progress' | null;
type Group = 'doors' | 'closets' | 'outdoor' | 'interior';
interface PhotoDef { n: number; yelp?: string; group: Group; stage: Stage; title: string; alt: string }

const defs = {
  'wall-trim-panels-in-progress': { n: 1, yelp: 'bwn_FHfZDyHsFVb0XR6Jow', group: 'interior', stage: 'in-progress', title: 'Wall trim and panel layout', alt: 'Empty room with panel molding being laid out on the walls and a miter saw on the protected floor' },
  'wall-panels-and-molding-in-progress': { n: 2, yelp: 'cWG7dHJLpKq1XvWg9DDlDA', group: 'interior', stage: 'in-progress', title: 'Panel molding and recessed wall section', alt: 'Wall with panel molding and a recessed section under construction, trim pieces on the floor' },
  'dining-room-wood-slat-wall': { n: 3, yelp: '5JSfM8RybDP2rCSONNyJHw', group: 'interior', stage: 'completed', title: 'Wood slat wall in a dining room', alt: 'Finished dining room with a full wall of vertical light wood slats behind a glass table and white chairs' },
  'wall-cladding-and-beam-in-progress-a': { n: 4, yelp: 'EWkpYvfH33IFoXqjharyTg', group: 'interior', stage: 'in-progress', title: 'Wall cladding and ceiling beam', alt: 'Long room with brown wall cladding panels and a dark wood ceiling beam during installation' },
  'wall-cladding-and-beam-in-progress-b': { n: 5, yelp: 'Zi-sB4oT1BZiJG2KVzjUqw', group: 'interior', stage: 'in-progress', title: 'Wall cladding, second view', alt: 'Another angle of the brown wall cladding and dark wood beam, with the floor still covered' },
  'white-radiator-cover': { n: 6, yelp: 'Xh1o4Nu3IqxccEoydnAqKw', group: 'interior', stage: null, title: 'White radiator cover', alt: 'White radiator cover with a vertical slatted front against a white wall' },
  'interior-doors-and-frames-in-progress': { n: 7, yelp: 'OD9HqEoSi0LYJvz-8LHG6g', group: 'doors', stage: 'in-progress', title: 'Interior doors and frames', alt: 'White interior doors set in new frames in a hallway under construction' },
  'dining-room-wood-slat-wall-wide': { n: 8, yelp: 'nSrkhd38mcKuMjYQfeDfFQ', group: 'interior', stage: 'completed', title: 'Wood slat wall, wide view', alt: 'Wide view of a dining room with a vertical wood slat wall wrapping around an opening toward a window' },
  'window-wall-slatted-enclosure-in-progress': { n: 9, yelp: 'i606E7EOOq9vC07hUGQ1Uw', group: 'interior', stage: 'in-progress', title: 'Window wall with slatted enclosure', alt: 'Room under renovation with a slatted wood enclosure below a window and framing for a window soffit' },
  'backyard-deck-white-railing': { n: 10, yelp: 'Qmj87VyHEzQkc-PG_Wo52A', group: 'outdoor', stage: 'completed', title: 'Backyard deck with white railing', alt: 'Brown deck boards enclosed by a white railing, overlooking a tree-lined backyard' },
  'dining-room-wood-slat-wall-detail': { n: 11, yelp: 'WBJ56cg0MuZhin2NN7hFPA', group: 'interior', stage: 'completed', title: 'Wood slat wall, detail', alt: 'Dining room with a vertical wood slat wall, a glass dining table and white upholstered chairs' },
  'rooftop-terrace-circular-deck': { n: 12, yelp: 'aioGNV6_VC18TcVfJ6-0lg', group: 'outdoor', stage: null, title: 'Rooftop terrace with a circular deck', alt: 'View from above of a rooftop terrace with a circular wood deck platform, curved benches and slatted wood screens' },
  'geometric-accent-wall-in-progress': { n: 13, yelp: 'Plu0yYcCceC7mFW_dwdNSg', group: 'interior', stage: 'in-progress', title: 'Geometric accent wall', alt: 'Accent wall with angled wood panels over a blue background during installation' },
  'hallway-interior-doors': { n: 14, yelp: 'Q6VxcLIN5yoqQ7dHwhQ-mg', group: 'doors', stage: 'in-progress', title: 'Hallway with interior doors', alt: 'Narrow white hallway lined with interior doors, construction dust still on the floor' },
  'ceiling-molding-in-progress': { n: 15, yelp: 'z_ovGKsYXoehuHX0ly3MzA', group: 'interior', stage: 'in-progress', title: 'Ceiling molding', alt: 'Room with a recessed ceiling outlined in molding, with ladders and tools on the floor' },
  'crew-interior-finish-work': { n: 16, yelp: 'y4R-vLbF--Gm56hBQPkh1w', group: 'interior', stage: 'in-progress', title: 'Crew at work on interior finishes', alt: 'Two workers on ladders working on wall and ceiling finishes in a room under renovation' },
  'entry-vestibule-glass-doors-in-progress': { n: 17, yelp: 'rmljz0ug4txLgCA-7kuH_w', group: 'doors', stage: 'in-progress', title: 'Entry vestibule doors', alt: 'Covered entry with three dark-framed glass doors set in wood-look wall cladding, still under construction' },
  // Sent by the client on 2026-10-28 to replace photo 18 (doors staged outdoors); not on Yelp.
  'arched-wood-doors-hallway': { n: 33, group: 'doors', stage: 'completed', title: 'Arched wood doors in a hallway', alt: 'Hallway with four arched wood doors with vertically grooved panels, matching arched casing and brass hardware' },
  'door-frames-during-installation': { n: 19, yelp: 'h2KN-W1M466GtGj3YSNhRg', group: 'doors', stage: 'in-progress', title: 'Doors and frames during installation', alt: 'White doors and frames being installed along a wall, with materials on the floor' },
  'living-room-moldings-arched-windows': { n: 20, yelp: '8N0OGleJZEkhbT_OoNcXtw', group: 'interior', stage: 'completed', title: 'Living room with ceiling molding', alt: 'Finished living room with ceiling molding, patterned carpet and three arched windows' },
  'deck-and-gazebo': { n: 21, yelp: 'uExp7uiLYP8HOO17GRy91w', group: 'outdoor', stage: null, title: 'Deck leading to a gazebo', alt: 'Gray deck boards leading into a wood gazebo with railings, trees behind' },
  'white-built-in-shelving-in-progress': { n: 22, yelp: 'LFhyXxb-OJVZVy6rQ9MD_g', group: 'interior', stage: 'in-progress', title: 'White built-in shelving', alt: 'Worker installing tall white built-in shelving along a wall' },
  'vertical-wood-shelving-unit': { n: 23, yelp: 'KWuyUcZ8KTYd1fi-PMnYEQ', group: 'interior', stage: null, title: 'Vertical wood shelving unit', alt: 'Tall dark wood shelving unit with offset compartments next to a floor-to-ceiling window' },
  'bathroom-vanity-cabinet-in-progress': { n: 24, yelp: 'xmXWycpZbNA3aVks-vIFoQ', group: 'interior', stage: 'in-progress', title: 'Bathroom vanity and wall cabinet', alt: 'Bathroom with a vanity under a marble top and a wood-framed wall cabinet being installed' },
  'stairwell-window': { n: 25, yelp: 'V7numfgOldaaiX3hIxVjNw', group: 'interior', stage: null, title: 'Stairwell window', alt: 'View down a spiral stair toward a multi-pane window' },
  'wood-door-glass-panel': { n: 26, yelp: 'fdxnits75M4e1TDuLy_IDg', group: 'doors', stage: 'in-progress', title: 'Wood door with glass panel', alt: 'Wood door with a full-length textured glass panel and wood casing, protective film still on the glass' },
  'walk-in-closet-shelving': { n: 27, yelp: 'ANVWXu59kcZ6bTuHxpNusg', group: 'closets', stage: 'completed', title: 'Walk-in closet shelving', alt: 'Walk-in closet with white shelves following angled corners above a hanging rod' },
  'white-double-closet-doors': { n: 28, yelp: 'XfGLKV0ZKpT1FcQ9a-XNWg', group: 'closets', stage: null, title: 'Paired closet doors', alt: 'Three pairs of white paneled closet doors with black knobs and hinges along one wall' },
  'entry-door-sidelights-in-progress': { n: 29, yelp: 'EJCjb0eVAxVDmmr6uLOBAw', group: 'doors', stage: 'in-progress', title: 'Entry door with sidelights', alt: 'Dark paneled entry door flanked by two glass sidelights in a brick facade, during installation' },
  'wood-shelving-wall-integrated-lighting': { n: 30, yelp: 'horJ4MTaHvVWuTB2sBVHIQ', group: 'interior', stage: null, title: 'Wood shelving wall', alt: 'Wood shelving wall with lit shelves and a desk niche beside a wood-clad column' },
  'wood-radiator-cover': { n: 31, yelp: 'ZaLv7MR0kpsWxvnsBNcoag', group: 'interior', stage: 'in-progress', title: 'Wood radiator cover', alt: 'Wood radiator cover with a slatted front below a window, floor still protected' },
  'geometric-accent-wall-backlit': { n: 32, yelp: 'zYatHTJurnrnFj7RAgQtzQ', group: 'interior', stage: 'completed', title: 'Geometric accent wall, finished', alt: 'Bedroom with a geometric paneled accent wall behind the bed, edged with blue light' },
} as const satisfies Record<string, PhotoDef>;

export type PhotoId = keyof typeof defs;
export const photoIds = Object.keys(defs) as PhotoId[];

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });

export function photo(id: PhotoId) {
  const file = files[`../assets/photos/${id}.jpg`];
  if (!file) throw new Error(`Missing photo file for "${id}"`);
  const def: PhotoDef = defs[id];
  return { id, ...def, src: file.default };
}

export const stageLabel = { completed: 'Completed', 'in-progress': 'In progress' } as const;

export const groups: { id: Group; title: string; intro: string }[] = [
  { id: 'doors', title: 'Doors', intro: 'Interior doors, entry doors and glass-panel doors, most photographed during installation.' },
  { id: 'closets', title: 'Closets', intro: 'Closet shelving and paired closet doors.' },
  { id: 'outdoor', title: 'Decks and outdoor spaces', intro: 'A backyard deck, a deck leading to a gazebo and a rooftop terrace.' },
  { id: 'interior', title: 'Interior projects', intro: 'Wall details, moldings, shelving and radiator covers, finished and in progress.' },
];

// Reels from instagram.com/trim_experts. Topics follow each post's caption; no MP4 files are hosted.
export const reels = [
  { id: 'DesvCHoxMTD', topic: 'White oak doors', date: '2026-10' },
  { id: 'DeKAjecg0Xa', topic: 'Decking and pavers, project progress', date: '2026-10' },
  { id: 'Ddo0TYAhw8J', topic: 'New project: custom house', date: '2026-09' },
  { id: 'DdVOazut5Ao', topic: 'Decking in progress', date: '2026-09' },
  { id: 'DdHpME2pQ3J', topic: 'Custom closets', date: '2026-09' },
  { id: 'Db9qiVhOm0R', topic: 'Ipe wood', date: '2026-08' },
  { id: 'DbzMlfXpRbb', topic: 'Decking', date: '2026-08' },
  { id: 'DbUKpphJewX', topic: 'Custom doors', date: '2026-07' },
  { id: 'DaylSN5pgut', topic: 'Decking', date: '2026-07' },
  { id: 'DYtEcO3Nlt1', topic: 'Decking', date: '2026-05' },
  { id: 'DYUcEJlpkvT', topic: 'Doors: new project', date: '2026-05' },
  { id: 'DYMv1lrubn-', topic: 'Summer decking', date: '2026-05' },
] as const;

export type ReelId = (typeof reels)[number]['id'];
export const reelUrl = (id: string) => `https://www.instagram.com/trim_experts/reel/${id}/`;
