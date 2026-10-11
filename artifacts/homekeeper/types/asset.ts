export const ASSET_CATEGORIES = [
  'Air conditioning',
  'Kitchen',
  'Laundry',
  'Heating',
  'Plumbing',
  'Electrical',
  'Other',
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  brand: string;
  purchaseDate: string;
  warrantyExpiry: string;
  notes: string;
}

export type AssetInput = Omit<Asset, 'id'>;
