import { createContext, useContext, useEffect, useState } from "react";
import { ReadingMetadata } from "@/types/readings";
import { fetchAllAvailableReadings, fetchFeedReadings, fetchSavedReadings } from "@/services/readings";
import { useLoading } from "./useLoading";

type HomeContextType = {
  // Data
  readings: ReadingMetadata[];
  selectedSegment: string;
  setSelectedSegment: (segment: string) => void;
  refreshReadings: () => Promise<void>;

  // Modal visibility
  isProfileModalVisible: boolean;
  showProfileModal: () => void;
  hideProfileModal: () => void;
};

// const seedReadings: ReadingMetadata[] = [
//   {
//     title: "Winnie The Pooh",
//     genre: "Childrens",
//     rating: "34",
//     body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ultricies nulla a enim mattis rhoncus. Nunc vehicula eu ex eget tristique. Aliquam ut nibh fermentum, molestie mi et, iaculis purus. Phasellus aliquam feugiat sem, ut semper risus egestas vel. Nunc urna arcu, venenatis at vehicula nec, auctor vel sapien. Suspendisse sit amet nulla lectus. Nunc ut odio leo. Vivamus sit amet justo nec magna tincidunt volutpat. Praesent feugiat dolor at magna rhoncus, at rhoncus purus fermentum...",
//   },
//   {
//     title: "Student Eating Habits",
//     genre: "Health",
//     rating: "45",
//     body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ultricies nulla a enim mattis rhoncus. Nunc vehicula eu ex eget tristique. Aliquam ut nibh fermentum, molestie mi et, iaculis purus. Phasellus aliquam feugiat sem, ut semper risus egestas vel. Nunc urna arcu, venenatis at vehicula nec, auctor vel sapien. Suspendisse sit amet nulla lectus. Nunc ut odio leo. Vivamus sit amet justo nec magna tincidunt volutpat. Praesent feugiat dolor at magna rhoncus, at rhoncus purus fermentum...",
//   },
//   {
//     title: "Gators Win National Championship",
//     genre: "Sports",
//     rating: "80",
//     body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ultricies nulla a enim mattis rhoncus. Nunc vehicula eu ex eget tristique. Aliquam ut nibh fermentum, molestie mi et, iaculis purus. Phasellus aliquam feugiat sem, ut semper risus egestas vel. Nunc urna arcu, venenatis at vehicula nec, auctor vel sapien. Suspendisse sit amet nulla lectus. Nunc ut odio leo. Vivamus sit amet justo nec magna tincidunt volutpat. Praesent feugiat dolor at magna rhoncus, at rhoncus purus fermentum...",
//   },
// ];

const HomeContext = createContext<HomeContextType | null>(null);

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [readings, setReadings] = useState<ReadingMetadata[]>([]);
  const [selectedSegment, setSelectedSegment] = useState('Feed');
  const { showLoading, hideLoading } = useLoading();

  const fetchFeed = async () => {
    const data = await fetchAllAvailableReadings();
    setReadings(data);
  };

  const fetchPrivate = async () => {
    const data = await fetchSavedReadings();
    setReadings(data);
  };

  const refreshReadings = async () => {
    showLoading("Loading...", "book");
    try {
      if (selectedSegment === 'Feed') {
        await fetchFeed();
      } else {
        await fetchPrivate();
      }
      //await new Promise(r => setTimeout(r, 2000))
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    refreshReadings();
  }, [selectedSegment]);

  return (
    <HomeContext.Provider
      value={{
        readings,
        selectedSegment,
        setSelectedSegment,
        refreshReadings,
        isProfileModalVisible,
        showProfileModal: () => setProfileModalVisible(true),
        hideProfileModal: () => setProfileModalVisible(false),
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
}
