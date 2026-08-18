import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { usePrescriptionUploadService } from "@/src/features/prescription/scanner/usePrescriptionUploadService";

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@/src/features/prescription/scanner/scanner.service", () => ({
  ScannerService: { scan: jest.fn() },
}));

const documentPicker = DocumentPicker as jest.Mocked<typeof DocumentPicker>;
const imagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe("usePrescriptionUploadService permission messages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("shows the file/storage message when PDF permission is denied, not the photo message", async () => {
    imagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: "denied",
    } as never);
    const { result } = renderHook(() =>
      usePrescriptionUploadService({ onAssetsReady: jest.fn() }),
    );

    await act(async () => {
      await result.current.pickPdf();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "File Access Required",
      "CareSure needs access to your files to upload a prescription PDF. Please allow Storage access in Settings to continue.",
      expect.any(Array),
    );
    expect(documentPicker.getDocumentAsync).not.toHaveBeenCalled();
  });

  it("picks the PDF once permission is granted", async () => {
    imagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: "granted",
    } as never);
    documentPicker.getDocumentAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///a.pdf", name: "a.pdf" } as never],
    } as never);
    const onAssetsReady = jest.fn();
    const { result } = renderHook(() =>
      usePrescriptionUploadService({ onAssetsReady }),
    );

    await act(async () => {
      await result.current.pickPdf();
    });

    expect(onAssetsReady).toHaveBeenCalledWith([
      { uri: "file:///a.pdf", name: "a.pdf", fileName: "a.pdf", mimeType: "application/pdf" },
    ]);
  });

  it("shows the camera message when camera permission is permanently denied", async () => {
    imagePicker.requestCameraPermissionsAsync.mockResolvedValue({
      status: "denied",
      canAskAgain: false,
    } as never);
    const { result } = renderHook(() =>
      usePrescriptionUploadService({ onAssetsReady: jest.fn() }),
    );

    await act(async () => {
      await result.current.takePhoto();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Camera Access Required",
      "CareSure needs access to your camera to take a photo of your prescription. Please allow Camera access in Settings to continue.",
      expect.any(Array),
    );
  });

  it("still shows the photo message when gallery permission is denied", async () => {
    imagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: "denied",
    } as never);
    const { result } = renderHook(() =>
      usePrescriptionUploadService({ onAssetsReady: jest.fn() }),
    );

    await act(async () => {
      await result.current.chooseFromGallery();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Photo Access Required",
      "CareSure needs access to your photos to upload a prescription. Please allow Photo access in Settings to continue.",
      expect.any(Array),
    );
  });
});
