import { prescriptionService } from "@/src/services/prescription.service";
import { prescriptionApi } from "@/src/api/prescription.api";
import { PRESCRIPTION_CATEGORY } from "@/src/constants/prescription-category";
import { AppError } from "@/src/api/errors";

jest.mock("@/src/api/prescription.api", () => ({
  prescriptionApi: {
    upload: jest.fn(),
    getById: jest.fn(),
    list: jest.fn(),
    dismiss: jest.fn(),
  },
}));

describe("prescriptionService — Payload & Exception Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("upload passes payload to API and wraps success result", async () => {
    const mockRx = {
      id: "rx-55",
      category: 1,
      imageUrls: ["https://img.com/1.jpg"],
    } as any;
    (prescriptionApi.upload as jest.Mock).mockResolvedValueOnce(mockRx);

    const result = await prescriptionService.upload({
      imageUrls: ["https://img.com/1.jpg"],
    });

    expect(prescriptionApi.upload).toHaveBeenCalledWith({
      imageUrls: ["https://img.com/1.jpg"],
      category: PRESCRIPTION_CATEGORY.ORDER,
    });
    expect(result).toEqual({ success: true, data: mockRx });
  });

  it("maps AppError exceptions to failure result", async () => {
    (prescriptionApi.upload as jest.Mock).mockRejectedValueOnce(
      new AppError("validation", "Invalid image format"),
    );

    const result = await prescriptionService.upload({
      imageUrls: ["invalid.txt"],
    });

    expect(result).toEqual({ success: false, error: "Invalid image format" });
  });

  it("getById returns prescription details on success", async () => {
    const mockRx = { id: "rx-99", status: "APPROVED" } as any;
    (prescriptionApi.getById as jest.Mock).mockResolvedValueOnce(mockRx);

    const result = await prescriptionService.getById("rx-99");
    expect(result).toEqual({ success: true, data: mockRx });
  });
});
