import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Helpers ────────────────────────────────────────────────────────────────────
function makeCtx(role: "admin" | "user" | "committee" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

// ── Auth Tests ─────────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
  });
});

// ── Events Router Tests ────────────────────────────────────────────────────────
describe("events.list", () => {
  it("is accessible without authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    // Should not throw even without auth
    const result = await caller.events.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts activeOnly filter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.events.list({ activeOnly: true });
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts category filter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.events.list({ category: "parade" });
    expect(Array.isArray(result)).toBe(true);
    result.forEach((e) => expect(e.category).toBe("parade"));
  });
});

describe("events.create", () => {
  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.events.create({
        slug: "test-event",
        title: "Test Event",
        category: "other",
      })
    ).rejects.toThrow();
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.events.create({
        slug: "test-event",
        title: "Test Event",
        category: "other",
      })
    ).rejects.toThrow();
  });
});

// ── Parade Router Tests ────────────────────────────────────────────────────────
describe("parade.list", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.parade.list({ year: 2026 })).rejects.toThrow();
  });

  it("is accessible to admin users", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.parade.list({ year: 2026 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("parade.register", () => {
  it("is accessible without authentication (public form)", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    // This should be callable (public procedure) — we just test it doesn't throw auth error
    // It may fail on DB constraints, but not auth
    try {
      await caller.parade.register({
        entryName: "Test Float",
        entryType: "float",
        contactFirstName: "John",
        contactLastName: "Doe",
        contactEmail: "john@example.com",
        year: 2026,
        isReturning: false,
      });
    } catch (e: any) {
      // Should not be an auth error
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

// ── Heritage Router Tests ──────────────────────────────────────────────────────
describe("heritage.presidents", () => {
  it("is publicly accessible", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.heritage.presidents();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("heritage.timeline", () => {
  it("is publicly accessible", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.heritage.timeline();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── Queens Router Tests ────────────────────────────────────────────────────────
describe("queens.list", () => {
  it("is publicly accessible", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.queens.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── Committees Router Tests ────────────────────────────────────────────────────
describe("committees.list", () => {
  it("is publicly accessible", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.committees.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── Admin Router Tests ─────────────────────────────────────────────────────────
describe("admin.stats", () => {
  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("rejects regular users", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("is accessible to admin users", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("totalSignups");
    expect(result).toHaveProperty("totalParade");
    expect(result).toHaveProperty("totalEvents");
    expect(result).toHaveProperty("totalQueens");
    expect(result).toHaveProperty("totalMembers");
  });

  it("is accessible to committee users", async () => {
    const caller = appRouter.createCaller(makeCtx("committee"));
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("totalSignups");
  });
});

// ── Signups Router Tests ───────────────────────────────────────────────────────
describe("signups.create", () => {
  it("is publicly accessible", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    try {
      await caller.signups.create({
        eventId: 1,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        type: "attendee",
      });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

// ── Logout Test ────────────────────────────────────────────────────────────────
describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const clearedCookies: string[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test",
        email: "test@example.com",
        name: "Test",
        loginMethod: "test",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => clearedCookies.push(name),
      } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBeGreaterThan(0);
  });
});
