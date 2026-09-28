import { describe, expect, it } from "vitest";

import { registrationSchema } from "@/features/auth/schemas/auth.schema";

const validRegistration = {
  fullName: "Ada Student",
  matricNumber: "DELSU/SCI/001",
  email: "ada@example.edu",
  programme: "Computer Science",
  level: "400",
  password: "StrongPass1",
  confirmPassword: "StrongPass1",
};

describe("registrationSchema", () => {
  it("accepts a valid student registration", () => {
    expect(registrationSchema.safeParse(validRegistration).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    expect(
      registrationSchema.safeParse({
        ...validRegistration,
        confirmPassword: "DifferentPass1",
      }).success,
    ).toBe(false);
  });

  it("requires a mixed-case password with a number", () => {
    expect(
      registrationSchema.safeParse({
        ...validRegistration,
        password: "password",
        confirmPassword: "password",
      }).success,
    ).toBe(false);
  });
});
