export interface Track {
  id: string;
  taskId?: string;
  title: string;
  audio_url: string;
  image_url: string;
  video_url?: string;
  tags: string;
  prompt?: string;
  status: string;
  lyrics?: string;
  createdAt?: string;
}

export interface StylePreset {
  name: string;
  tags: string;
}

export type VocalGender = "m" | "f" | "";

export type AIModel = "V4_5ALL" | "V4" | "V3_5";
