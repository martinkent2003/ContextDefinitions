import { createContext, useContext, useState } from "react";
import { UploadedFile, UploadMetadata } from "@/types/upload";
import { recognizeText } from "rn-mlkit-ocr";
//import { extractText } from "expo-pdf-text-extract";

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
  isConfirmScanModalVisible: boolean;
  showConfirmTextModal: () => void;
  hideConfirmTextModal: () => void;
  showConfirmImageModal: () => void;
  hideConfirmImageModal: () => void;
  showConfirmFileModal: () => void;
  hideConfirmFileModal: () => void;
  showConfirmScanModal: () => void;
  hideConfirmScanModal: () => void;
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
  const [isConfirmScanModalVisible, setConfirmScanVisible] = useState(false);

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
    let text = "";
    if (upload.images.length > 0) {
      text = await runOcr(upload.images);
    } else if (upload.file) {
      text = "not working"
      //text = await extractText(upload.file.uri);
    }
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
        showConfirmTextModal: () => setTextModalVisible(true),
        hideConfirmTextModal: () => setTextModalVisible(false),
        isConfirmImageModalVisible,
        showConfirmImageModal: () => setConfirmImagesVisible(true),
        hideConfirmImageModal: () => setConfirmImagesVisible(false),
        isConfirmFileModalVisible,
        showConfirmFileModal: () => setConfirmFileVisible(true),
        hideConfirmFileModal: () => setConfirmFileVisible(false),
        isConfirmScanModalVisible,
        showConfirmScanModal: () => setConfirmScanVisible(true),
        hideConfirmScanModal: () => setConfirmScanVisible(false),
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