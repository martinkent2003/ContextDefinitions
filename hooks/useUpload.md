# Upload Context Store

## Why
`UploadReadingScreen` was managing all upload state locally via `useState` — uploaded file data, modal visibility, and picker logic. As more upload methods are added (scan, OCR, file upload), this would grow unwieldy. The `UploadText` modal was also losing metadata (title, genre, privacy) because `UploadedFile` didn't have fields for them.

## What Changed

### New: `hooks/useUpload.tsx`
A shared context following the same pattern as `useSession.tsx`. Provides:

**State:**
- `upload: UploadedFile` — core upload data (images, file, text)
- `metadata: UploadMetadata | null` — title, genre, privacy from the text modal
- `isTextModalVisible` / `isConfirmImagesVisible` — modal visibility

**Helper functions:**
- `setImages(uris)` — sets images, clears file/text, opens confirm modal
- `setFile(file)` — sets file, clears images/text
- `setText(content, title, genre, privacy)` — sets text + metadata, clears images/file
- `clearUpload()` — resets all state
- `showTextModal()` / `hideTextModal()` — toggle text modal
- `showConfirmImages()` / `hideConfirmImages()` — toggle confirm images modal

### Updated: `types/upload.ts`
- Renamed `UploadText` type to `UploadMetadata` (holds title, genre, privacy)

### Updated: `app/(tabs)/_layout.tsx`
- Wrapped `<Tabs>` with `<UploadProvider>` so all tab screens can access upload state

### Updated: `screens/UploadScreen/UploadReadingScreen.tsx`
- Removed all local `useState` for upload data and modal visibility
- Uses `useUpload()` hook — calls `setImages`, `setFile`, `showTextModal` directly
- Modals (`<UploadText />`, `<ConfirmImages />`) no longer receive props

### Updated: `screens/UploadScreen/Modals/UploadText.tsx`
- Removed `Props` type and all props (`visible`, `onClose`, `setDocument`)
- Uses `useUpload()` hook to read visibility and write data
- `setText(content, title, genre, privacy)` now preserves all metadata

### Updated: `screens/UploadScreen/Modals/ConfirmImages.tsx`
- Removed `Props` type and all props (`visible`, `imageUris`, `onConfirm`, `onCancel`)
- Uses `useUpload()` hook to read `upload.images` and control visibility

## Usage

```tsx
import { useUpload } from "@/hooks/useUpload";

// In any component inside UploadProvider:
const { upload, metadata, setImages, clearUpload } = useUpload();
```
