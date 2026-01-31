export type UploadedFile = {
  images: string[]; // multiple images
  file: { uri: string; name: string } | null; // single document
};
