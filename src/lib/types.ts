export type DiaryEntry = {
  id: string;
  date: string;
  plantTypeId: string | null;
  memo: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export type LegacyDiaryEntry = Omit<DiaryEntry, "imageUrls"> & {
  imageUrl?: string | null;
  imageUrls?: string[];
};

export type PlantType = {
  id: string;
  name: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DbSchema = {
  entries: DiaryEntry[];
  plantTypes: PlantType[];
};

export type CompressionSettings = {
  width: number;
  height: number;
  quality: number;
};
