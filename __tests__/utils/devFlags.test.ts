describe("devFlags module behavior", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("dev: set/get/clear/isGatePreview works when __DEV__=true", () => {
    (global as unknown as { __DEV__: boolean }).__DEV__ = true;
    jest.isolateModules(() => {
      const {
        setDevGatePreview,
        clearDevGatePreview,
        getDevGatePreview,
        isGatePreview,
      } = require("@/src/utils/devFlags");

      expect(getDevGatePreview()).toBeNull();
      setDevGatePreview("update");
      expect(getDevGatePreview()).toBe("update");
      expect(isGatePreview("update")).toBe(true);
      clearDevGatePreview();
      expect(getDevGatePreview()).toBeNull();
    });
  });

  test("prod: setters are no-ops when __DEV__=false", () => {
    (global as unknown as { __DEV__: boolean }).__DEV__ = false;
    jest.isolateModules(() => {
      const {
        setDevGatePreview,
        getDevGatePreview,
        isGatePreview,
      } = require("@/src/utils/devFlags");

      expect(getDevGatePreview()).toBeNull();
      setDevGatePreview("update");
      // setter is a no-op in production, value remains null
      expect(getDevGatePreview()).toBeNull();
      expect(isGatePreview("update")).toBe(false);
    });
  });
});
