import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";

const mockUseAuth = vi.fn();
vi.mock("../../src/hooks/useAuth", () => ({ default: () => mockUseAuth() }));

import ProtectedRoute from "../../src/components/ProtectedRoute";

function renderAt(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Protected content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a loading state while auth is resolving", () => {
    mockUseAuth.mockReturnValue({ auth: {}, loading: true });
    renderAt();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("redirects to /login when there is no authenticated user", () => {
    mockUseAuth.mockReturnValue({ auth: {}, loading: false });
    renderAt();
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the nested route when the user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      auth: { email: "user@example.com" },
      loading: false,
    });
    renderAt();
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
