import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../../src/lib/api-client", () => ({ apiFetch: vi.fn() }));

import { AuthProvider } from "../../src/features/auth/context/AuthProvider";
import useAuth from "../../src/hooks/useAuth";
import { apiFetch } from "../../src/lib/api-client";

function Consumer() {
  const { auth, loading } = useAuth();
  return <div data-testid="state">{loading ? "loading" : auth.email ?? "anon"}</div>;
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => vi.clearAllMocks());

  it("starts in a loading state while the session is checked", () => {
    apiFetch.mockReturnValue(new Promise(() => {})); // never resolves
    renderProvider();
    expect(screen.getByTestId("state")).toHaveTextContent("loading");
  });

  it("restores the session from /users/me on mount", async () => {
    apiFetch.mockResolvedValue({ email: "user@example.com" });
    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("user@example.com")
    );
    expect(apiFetch).toHaveBeenCalledWith("/users/me");
  });

  it("stays unauthenticated when /users/me is unauthorized", async () => {
    apiFetch.mockRejectedValue(new Error("UNAUTHORIZED"));
    renderProvider();

    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("anon"));
  });
});
