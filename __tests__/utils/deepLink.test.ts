import { redirectSystemPath } from "@/src/app/+native-intent";

describe("redirectSystemPath — Web & Deep-Link Route Rewriting", () => {
  it("rewrites /medicines/{slug}/{id} web path to /product/{id}", () => {
    const result = redirectSystemPath({
      path: "/medicines/paracip-650-tablet/CS-0173",
    });
    expect(result).toBe("/product/CS-0173");
  });

  it("rewrites /otc/{slug}/{id} web path to /product/{id}", () => {
    const result = redirectSystemPath({
      path: "/otc/dabur-chyawanprash/CS-0888",
    });
    expect(result).toBe("/product/CS-0888");
  });

  it("rewrites /fmcg/{slug}/{id} web path to /product/{id}", () => {
    const result = redirectSystemPath({
      path: "/fmcg/dettol-soap/CS-9999",
    });
    expect(result).toBe("/product/CS-9999");
  });

  it("strips scheme and host from full HTTP URLs before rewriting", () => {
    const result = redirectSystemPath({
      path: "https://qa-caresure.codeneptune.com/medicines/crocin/CS-1234",
    });
    expect(result).toBe("/product/CS-1234");
  });

  it("passes through non-product app paths without modification", () => {
    expect(
      redirectSystemPath({ path: "/(tabs)/categories" }),
    ).toBe("/(tabs)/categories");

    expect(
      redirectSystemPath({ path: "/(stack)/orders/ord-100" }),
    ).toBe("/(stack)/orders/ord-100");
  });

  it("handles null or undefined path safely by returning fallback / route", () => {
    expect(redirectSystemPath({ path: null })).toBe("/");
  });
});
