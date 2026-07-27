// Stable, unique-per-attempt key so the backend can dedupe order retries.
// Not security-critical, so Math.random is fine — avoids a native crypto dep.
export const newIdempotencyKey = (): string =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
