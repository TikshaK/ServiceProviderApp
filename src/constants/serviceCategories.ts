export const SERVICE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'AC Repair',
  'Painting',
  'Carpentry',
  'Appliance',
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];
