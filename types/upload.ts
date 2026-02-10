export type UploadedFile = {
  images: string[]; // multiple images
  file: { uri: string; name: string } | null; // single document
  text: string | null;
};

export type UploadText = {
  title: string;
  genre: string;
  content: string;
  privacy: boolean;
}