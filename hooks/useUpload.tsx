import { createContext, useContext, useState } from "react";
import { UploadedFile, UploadMetadata } from "@/types/upload";
import { recognizeText } from "rn-mlkit-ocr";

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
  isConfirmTextModalVisible: boolean;
  isConfirmImageModalVisible: boolean;
  isConfirmFileModalVisible: boolean;
  showConfirmTextModal: () => void;
  hideConfirmTextModal: () => void;
  showConfirmImageModal: () => void;
  hideConfirmImageModal: () => void;
  showConfirmFileModal: () => void;
  hideConfirmFileModal: () => void;
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
  const [isConfirmTextModalVisible, setTextModalVisible] = useState(false);
  const [isConfirmImageModalVisible, setConfirmImagesVisible] = useState(false);
  const [isConfirmFileModalVisible, setConfirmFileVisible] = useState(false);

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

  const runOcr = async (sources: string[]): Promise<string> => {
    //TODO: add specific language capabilities as it currently only works with english/spanish
    const results = await Promise.all(
      sources.map((uri) => recognizeText(uri))
    );
    return results.map((r) => r.text).join("\n");
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
        isConfirmTextModalVisible,
        isConfirmImageModalVisible,
        showConfirmTextModal: () => setTextModalVisible(true),
        hideConfirmTextModal: () => setTextModalVisible(false),
        showConfirmImageModal: () => setConfirmImagesVisible(true),
        hideConfirmImageModal: () => setConfirmImagesVisible(false),
        isConfirmFileModalVisible,
        showConfirmFileModal: () => setConfirmFileVisible(true),
        hideConfirmFileModal: () => setConfirmFileVisible(false),
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