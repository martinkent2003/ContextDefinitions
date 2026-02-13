import { createContext, useContext, useState } from "react";
import { UploadedFile, UploadMetadata } from "@/types/upload";
import { recognizeText } from "rn-mlkit-ocr";
import { uploadReading } from "@/services/readings";
import { Alert } from "react-native";
import { useLoading } from "./useLoading";
import { useHome } from "./useHome";
//import { convert } from "react-native-pdf-to-image";

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
  const { showLoading, hideLoading } = useLoading();

  const { fetchFeed } = useHome();

  const setImages = (uris: string[]) => {
    setUpload({ images: uris, file: null, text: null });
    setMetadata(null);
  };

  const setFile = (file: { uri: string; name: string }) => {
    setUpload({ images: [], file, text: null });
    setMetadata(null);
  };

  const setText = async (content: string, title: string, genre: string, privacy: boolean) => {
    setUpload({ images: [], file: null, text: content });
    setMetadata({ title, genre, privacy });
    //here trigger the supabase function since we already have what we need in upload and metadata
      //push to supabase shit
    try {
      showLoading("Uploading Reading...", "typing")
      const result = await uploadReading(content, title, genre, privacy)
      hideLoading()
      Alert.alert("Successfully uploaded " + title)
      fetchFeed()
    }
    catch (err) {
      Alert.alert("Error uploading " + title)
    }
  };

  const runOcr = async (sources: string[]): Promise<string> => {
    //TODO: add specific language capabilities as it currently only works with english/spanish
    const results = await Promise.all(
      sources.map((uri) => recognizeText(uri))
    );
    return results.map((r) => r.text).join("\n");
  };

  const processUpload = async () => {
    showLoading("Processing document...", "book");
    try {
      let text = "";
      if (upload.images.length > 0) {
        text = await runOcr(upload.images);
      } else if (upload.file) {
        //run the build before uncommenting this
        //const { outputFiles } = await convert(upload.file.uri);
        //text = await runOcr(outputFiles ?? []);
        text = "not yet"
      }
      setUpload((prev) => ({ ...prev, text }));
      setTextModalVisible(true);
    } finally {
      hideLoading();
    }
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