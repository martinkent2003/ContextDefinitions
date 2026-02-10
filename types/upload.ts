export type UploadedFile = {
  images: string[]; // multiple images
  file: { uri: string; name: string } | null; // single document
  text: string | null;
};

export type UploadMetadata = {
  title: string;
  genre: string;
  privacy: boolean;
};