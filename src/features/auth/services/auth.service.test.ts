import { describe, expect, it } from "vitest";

import { normalizeMatricNumber } from "@/features/auth/services/auth.service";

describe("normalizeMatricNumber", () => {
  it("normalizes casing and whitespace", () => {
    expect(normalizeMatricNumber("  delsu / sci / 001 ")).toBe("DELSU/SCI/001");
  });
});
