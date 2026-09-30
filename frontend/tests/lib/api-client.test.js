import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiFetch } from "../../src/lib/api-client";

function fakeResponse({ status = 200, ok = true, json = {} } = {}) {
  return { status, ok, json: async () => json };
}

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed JSON on a 200 response", async () => {
    fetch.mockResolvedValue(fakeResponse({ json: { email: "user@example.com" } }));
    const data = await apiFetch("/users/me");
    expect(data).toEqual({ email: "user@example.com" });
  });

  it("returns null on 204 (no content)", async () => {
    fetch.mockResolvedValue(fakeResponse({ status: 204, ok: true }));
    expect(await apiFetch("/auth/jwt/logout", { method: "POST" })).toBeNull();
  });

  it("throws UNAUTHORIZED on 401", async () => {
    fetch.mockResolvedValue(fakeResponse({ status: 401, ok: false }));
    await expect(apiFetch("/users/me")).rejects.toThrow("UNAUTHORIZED");
  });

  it("throws the status code on other non-ok responses", async () => {
    fetch.mockResolvedValue(fakeResponse({ status: 400, ok: false }));
    await expect(apiFetch("/auth/jwt/login", { method: "POST" })).rejects.toThrow(
      "400"
    );
  });

  it("always sends credentials for cookie auth", async () => {
    fetch.mockResolvedValue(fakeResponse());
    await apiFetch("/users/me");
    const [, options] = fetch.mock.calls[0];
    expect(options.credentials).toBe("include");
  });

  it("sets a urlencoded Content-Type for the login endpoint", async () => {
    fetch.mockResolvedValue(fakeResponse({ status: 204, ok: true }));
    await apiFetch("/auth/jwt/login", { method: "POST" });
    const [, options] = fetch.mock.calls[0];
    expect(options.headers.get("Content-Type")).toBe(
      "application/x-www-form-urlencoded"
    );
  });

  it("sets a JSON Content-Type for the register endpoint", async () => {
    fetch.mockResolvedValue(fakeResponse({ status: 201, ok: true }));
    await apiFetch("/auth/register", { method: "POST" });
    const [, options] = fetch.mock.calls[0];
    expect(options.headers.get("Content-Type")).toBe("application/json");
  });

  it("does not set a Content-Type for other endpoints", async () => {
    fetch.mockResolvedValue(fakeResponse());
    await apiFetch("/users/me");
    const [, options] = fetch.mock.calls[0];
    expect(options.headers.get("Content-Type")).toBeNull();
  });

  it("forwards method and body from options", async () => {
    fetch.mockResolvedValue(fakeResponse({ status: 204, ok: true }));
    const body = new URLSearchParams({ username: "a", password: "b" });
    await apiFetch("/auth/jwt/login", { method: "POST", body });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain("/auth/jwt/login");
    expect(options.method).toBe("POST");
    expect(options.body).toBe(body);
  });
});
