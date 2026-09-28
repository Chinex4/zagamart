import { describe, expect, it } from "vitest";
import { canAccessAdmin, canAccessStudent } from "./auth.service";
describe("server authorization policy", () => {
  it("allows only active admins into administration", () => {
    expect(canAccessAdmin({ role: "admin", account_status: "active" })).toBe(
      true,
    );
    expect(canAccessAdmin({ role: "student", account_status: "active" })).toBe(
      false,
    );
    expect(canAccessAdmin({ role: "admin", account_status: "suspended" })).toBe(
      false,
    );
    expect(canAccessAdmin(null)).toBe(false);
  });
  it("denies suspended students", () => {
    expect(
      canAccessStudent({ role: "student", account_status: "active" }),
    ).toBe(true);
    expect(
      canAccessStudent({ role: "student", account_status: "suspended" }),
    ).toBe(false);
    expect(canAccessStudent({ role: "admin", account_status: "active" })).toBe(
      false,
    );
  });
});
