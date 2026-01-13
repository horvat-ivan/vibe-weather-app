export type VibeId =
  | 'storm-mode'
  | 'heatwave'
  | 'humid-haze'
  | 'wind-shift'
  | 'coastal-glow'
  | 'crisp-active'
  | 'layered-chill'
  | 'default-balance';

export type VibeDescriptor = {
  id: VibeId;
  name: string;
  tagline: string;
  summary: string;
  icon: string;
  baseTags: string[];
  wardrobe: string;
  activities: string;
  alerts: string;
};

export const VIBE_TAXONOMY: Record<VibeId, VibeDescriptor> = {
  'storm-mode': {
    id: 'storm-mode',
    name: 'Storm mode',
    tagline: 'Indoor-first, eyes on radar',
    summary: 'High precipitation risk keeps things slippery and lightning-prone.',
    icon: '⛈️',
    baseTags: ['Heavy rain', 'Gusty winds', 'Transit cushion'],
    wardrobe: 'Waterproof shells, sealed footwear, and layers that dry quickly.',
    activities: 'Slide outdoor plans indoors or keep them short with quick shelter options.',
    alerts: 'Pad commutes, avoid exposed rooftops, and monitor local warnings.',
  },
  heatwave: {
    id: 'heatwave',
    name: 'Heatwave pulse',
    tagline: 'Protect your energy and hydrate often',
    summary: 'Feels-like temps push into the extreme zone with relentless sun exposure.',
    icon: '☀️',
    baseTags: ['Heat advisory', 'Hydrate hourly', 'Shade hunt'],
    wardrobe: 'Ultralight natural fibers plus SPF, hats, and cooling towels.',
    activities: 'Front-load errands before noon and chase breezy rooftops after sunset.',
    alerts: 'Limit mid-day exertion and check on pets, plants, and neighbors.',
  },
  'humid-haze': {
    id: 'humid-haze',
    name: 'Humid haze',
    tagline: 'Muggy glow with slow evenings',
    summary: 'Warm sticky air makes everything feel heavier even without storms.',
    icon: '💧',
    baseTags: ['Sticky feel', 'Hydrate + rest', 'Frizz management'],
    wardrobe: 'Linen or tech fabrics, breathable footwear, and anti-frizz planning.',
    activities: 'Mix indoor respites with waterfront breezes or shaded patios.',
    alerts: 'Leave extra commute padding and prep for pop-up showers.',
  },
  'wind-shift': {
    id: 'wind-shift',
    name: 'Wind shift',
    tagline: 'Anchor layers and secure the patio',
    summary: 'Sustained winds make things feel cooler and keep debris in play.',
    icon: '💨',
    baseTags: ['Wind 20+ mph', 'Secure hats', 'Gust alerts'],
    wardrobe: 'Windbreakers or structured outerwear plus eyewear for debris.',
    activities: 'Lean into boardwalk walks, kites, or indoor plans out of the gusts.',
    alerts: 'Watch for bridge delays and shifting transit service.',
  },
  'coastal-glow': {
    id: 'coastal-glow',
    name: 'Coastal glow',
    tagline: 'Soft light, breezy focus',
    summary: 'Mild temps and gentle breezes make it easy to be outside.',
    icon: '🌤️',
    baseTags: ['Low rain risk', 'Marine layer fades', 'UV moderate'],
    wardrobe: 'Light layers, sunglasses, and coastal-friendly footwear.',
    activities: 'Outdoor coworking, coffee walks, and easy errand loops.',
    alerts: 'Track the marine layer timing and bring a light layer for evenings.',
  },
  'crisp-active': {
    id: 'crisp-active',
    name: 'Crisp active',
    tagline: 'Energy-forward chill',
    summary: 'Cool but dry air keeps energy high and layers comfortable.',
    icon: '🍃',
    baseTags: ['Low humidity', 'Layer-friendly', 'Sun breaks'],
    wardrobe: 'Layered knits or light jackets with comfortable sneakers.',
    activities: 'Jogging, cycling, or productivity sprints outdoors.',
    alerts: 'Mind overnight lows for plants and windows.',
  },
  'layered-chill': {
    id: 'layered-chill',
    name: 'Layered chill',
    tagline: 'Stack knits and keep moves short',
    summary: 'Cold air dominates the day so insulation is key.',
    icon: '🧣',
    baseTags: ['Cold snap', 'Layer up', 'Cozy focus'],
    wardrobe: 'Insulated layers, scarves, gloves, and warm footwear.',
    activities: 'Indoor-first with short bundled walks or errands.',
    alerts: 'Watch for frost, slick spots, and protect pipes/pets.',
  },
  'default-balance': {
    id: 'default-balance',
    name: 'Balanced blend',
    tagline: 'Flexible flow day',
    summary: 'Conditions stay even-keeled with no major spikes.',
    icon: '✨',
    baseTags: ['On track', 'Low risk', 'Flex plans'],
    wardrobe: 'Versatile layers and comfortable footwear match most plans.',
    activities: 'Mix indoor/outdoor as needed — nothing extreme in play.',
    alerts: 'Keep an eye on the hourly chart for subtle swings.',
  },
};
