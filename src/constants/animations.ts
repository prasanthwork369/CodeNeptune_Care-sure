// Source of truth moved to src/theme/animations — import from there in new code.
// This file re-exports for backward compatibility.
import { durations, springs } from "@/src/theme";

export const ANIMATION_CONSTANTS = {
    DURATIONS: durations,
    SPRINGS: springs,
    ENABLED: true,
    USE_NATIVE_DRIVER: true,
};
