import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const mockUseAuth = vi.fn();
vi.mock("../src/hooks/useAuth", () => ({ default: () => mockUseAuth() }));
vi.mock("../src/lib/api-client", () => ({ apiFetch: vi.fn() }));

import App from "../src/App";

function renderApp(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe("App routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: an unauthenticated, resolved session.
    mockUseAuth.mockReturnValue({ auth: {}, loading: false, setAuth: vi.fn() });
  });

  it("always renders the navbar", () => {
    renderApp("/login");
    expect(screen.getByText("ToneBridge")).toBeInTheDocument();
  });

  it("renders the login page at /login", () => {
    renderApp("/login");
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("renders the signup page at /signup", () => {
    renderApp("/signup");
    expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
  });

  it("redirects unauthenticated users from / to /login", () => {
    renderApp("/");
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("shows the loading gate on / while the session resolves", () => {
    mockUseAuth.mockReturnValue({ auth: {}, loading: true, setAuth: vi.fn() });
    renderApp("/");
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Login" })).not.toBeInTheDocument();
  });
});
