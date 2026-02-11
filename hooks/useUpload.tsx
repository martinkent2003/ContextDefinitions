import { createContext, useContext, useState } from "react";
import { UploadedFile, UploadMetadata } from "@/types/upload";

type UploadContextType = {
  // Data
  upload: UploadedFile;
  metadata: UploadMetadata | null;

  // Setters
  setImages: (uris: string[]) => void;
  setFile: (file: { uri: string; name: string }) => void;
  setText: (content: string, title: string, genre: string, privacy: boolean) => void;
  processUpload: () => Promise<void>;
  clearUpload: () => void;

  // Modal visibility
  isTextModalVisible: boolean;
  isConfirmImagesVisible: boolean;
  showTextModal: () => void;
  hideTextModal: () => void;
  showConfirmImages: () => void;
  hideConfirmImages: () => void;
};

const defaultUpload: UploadedFile = {
  images: [],
  file: null,
  text: null,
};

const UploadContext = createContext<UploadContextType | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [upload, setUpload] = useState<UploadedFile>(defaultUpload);
  const [metadata, setMetadata] = useState<UploadMetadata | null>(null);
  const [isTextModalVisible, setTextModalVisible] = useState(false);
  const [isConfirmImagesVisible, setConfirmImagesVisible] = useState(false);

  const setImages = (uris: string[]) => {
    setUpload({ images: uris, file: null, text: null });
    setMetadata(null);
  };

  const setFile = (file: { uri: string; name: string }) => {
    setUpload({ images: [], file, text: null });
    setMetadata(null);
  };

  const setText = (content: string, title: string, genre: string, privacy: boolean) => {
    setUpload({ images: [], file: null, text: content });
    setMetadata({ title, genre, privacy });
  };

  // Private — not exposed in context. Shared by images, files, scan, etc.
  const runOcr = async (sources: string[]): Promise<string> => {
    // TODO: Replace with actual OCR library call
    return sources.map(() => "").join("\n");
  };

  const processUpload = async () => {
    const sources =
      upload.images.length > 0
        ? upload.images
        : upload.file
          ? [upload.file.uri]
          : [];
    const text = await runOcr(sources);
    setUpload((prev) => ({ ...prev, text }));
    setTextModalVisible(true);
  };

  const clearUpload = () => {
    setUpload(defaultUpload);
    setMetadata(null);
  };

  return (
    <UploadContext.Provider
      value={{
        upload,
        metadata,
        setImages,
        setFile,
        setText,
        processUpload,
        clearUpload,
        isTextModalVisible,
        isConfirmImagesVisible,
        showTextModal: () => setTextModalVisible(true),
        hideTextModal: () => setTextModalVisible(false),
        showConfirmImages: () => setConfirmImagesVisible(true),
        hideConfirmImages: () => setConfirmImagesVisible(false),
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
}
