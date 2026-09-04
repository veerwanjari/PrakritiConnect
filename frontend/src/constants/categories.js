// The set of environmental activity types volunteers can browse and
// organizers can publish under. Keeping this in one place keeps the
// filter chips, the create-event form, and event badges in sync.
export const CATEGORIES = [
  { value: 'Tree Plantation', icon: '🌳' },
  { value: 'Beach & River Cleanup', icon: '🏖️' },
  { value: 'Neighbourhood Cleanup', icon: '🧹' },
  { value: 'Waste Segregation & Recycling', icon: '♻️' },
  { value: 'Awareness Rally', icon: '📢' },
  { value: 'Wildlife Conservation', icon: '🦋' },
  { value: 'Water Conservation', icon: '💧' },
  { value: 'Eco Workshop', icon: '🌱' },
  { value: 'Community Garden', icon: '🌻' },
  { value: 'Sustainability Talk', icon: '🎤' },
];

export function categoryIcon(category) {
  return CATEGORIES.find((c) => c.value === category)?.icon || '🌿';
}
