import { prescriptionService } from "@/src/features/prescription/services/prescription.service";
import { prescriptionApi } from "@/src/features/prescription/api/prescription.api";
import { PRESCRIPTION_CATEGORY } from "@/src/features/prescription/constants/prescription-category";
import { AppError } from "@/src/api/errors";

jest.mock("@/src/features/prescription/api/prescription.api", () => ({
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
      fileData: [{ url: "https://img.com/1.jpg", name: null, size: null }],
    } as any;
    (prescriptionApi.upload as jest.Mock).mockResolvedValueOnce(mockRx);

    const result = await prescriptionService.upload({
      fileData: [{ url: "https://img.com/1.jpg" }],
    });

    expect(prescriptionApi.upload).toHaveBeenCalledWith({
      fileData: [{ url: "https://img.com/1.jpg" }],
      category: PRESCRIPTION_CATEGORY.ORDER,
    });
    expect(result).toEqual({ success: true, data: mockRx });
  });

  it("maps AppError exceptions to failure result", async () => {
    (prescriptionApi.upload as jest.Mock).mockRejectedValueOnce(
      new AppError("validation", "Invalid image format"),
    );

    const result = await prescriptionService.upload({
      fileData: [{ url: "invalid.txt" }],
    });

    expect(result).toEqual({ success: false, error: "Invalid image format" });
  });

  it("sends 1 image with numeric size correctly without string serialization", async () => {
    const mockRx = { id: "rx-101", category: 2 } as any;
    (prescriptionApi.upload as jest.Mock).mockResolvedValueOnce(mockRx);

    const payload = {
      fileData: [
        {
          url: "https://s3.amazonaws.com/caresure/1000314625.jpg",
          name: "1000314625.jpg",
          size: 4695181,
        },
      ],
      category: PRESCRIPTION_CATEGORY.ORDER,
    };

    const result = await prescriptionService.upload(payload);

    expect(prescriptionApi.upload).toHaveBeenCalledWith(payload);
    const passedInput = (prescriptionApi.upload as jest.Mock).mock.calls[0][0];
    expect(typeof passedInput.fileData[0].size).toBe("number");
    expect(passedInput.fileData[0].size).toBe(4695181);
    expect(result).toEqual({ success: true, data: mockRx });
  });

  it("sends 2 images with numeric sizes for multi-image Direct Upload", async () => {
    const mockRx = { id: "rx-102", category: 2 } as any;
    (prescriptionApi.upload as jest.Mock).mockResolvedValueOnce(mockRx);

    const payload = {
      fileData: [
        {
          url: "https://s3.amazonaws.com/caresure/img1.jpg",
          name: "img1.jpg",
          size: 1048576,
        },
        {
          url: "https://s3.amazonaws.com/caresure/img2.jpg",
          name: "img2.jpg",
          size: 2097152,
        },
      ],
      category: PRESCRIPTION_CATEGORY.ORDER,
    };

    const result = await prescriptionService.upload(payload);

    expect(prescriptionApi.upload).toHaveBeenCalledWith(payload);
    const passedInput = (prescriptionApi.upload as jest.Mock).mock.calls[0][0];
    expect(passedInput.fileData).toHaveLength(2);
    expect(typeof passedInput.fileData[0].size).toBe("number");
    expect(typeof passedInput.fileData[1].size).toBe("number");
    expect(passedInput.fileData[0].size).toBe(1048576);
    expect(passedInput.fileData[1].size).toBe(2097152);
    expect(result).toEqual({ success: true, data: mockRx });
  });

  it("supports Cart flow deferred upload payload structure with numeric category", async () => {
    const mockRx = { id: "rx-cart-1", category: 1 } as any;
    (prescriptionApi.upload as jest.Mock).mockResolvedValueOnce(mockRx);

    const cartPayload = {
      fileData: [
        { url: "https://s3.amazonaws.com/caresure/rx1.jpg" },
        { url: "https://s3.amazonaws.com/caresure/rx2.jpg" },
      ],
      category: PRESCRIPTION_CATEGORY.PRESCRIPTION_ORDER,
    };

    const result = await prescriptionService.upload(cartPayload);

    expect(prescriptionApi.upload).toHaveBeenCalledWith(cartPayload);
    const passedInput = (prescriptionApi.upload as jest.Mock).mock.calls[0][0];
    expect(passedInput.fileData).toHaveLength(2);
    expect(passedInput.category).toBe(1);
    expect(result).toEqual({ success: true, data: mockRx });
  });

  it("getById returns prescription details on success", async () => {
    const mockRx = { id: "rx-99", status: "APPROVED" } as any;
    (prescriptionApi.getById as jest.Mock).mockResolvedValueOnce(mockRx);

    const result = await prescriptionService.getById("rx-99");
    expect(result).toEqual({ success: true, data: mockRx });
  });
});
