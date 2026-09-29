import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

const mockNavigate = vi.fn();
const mockSetAuth = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("../src/hooks/useAuth", () => ({
  default: () => ({ setAuth: mockSetAuth }),
}));
vi.mock("../src/lib/api-client", () => ({ apiFetch: vi.fn() }));

import { NavBar } from "../src/components/NavBar";
import { apiFetch } from "../src/lib/api-client";

function renderNavBar() {
  return render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  );
}

describe("NavBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the brand and nav links", () => {
    renderNavBar();
    expect(screen.getByText("ToneBridge")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Logout" })).toBeInTheDocument();
  });

  it("logs out: POSTs to the logout endpoint, clears auth, and redirects", async () => {
    apiFetch.mockResolvedValue(null); // 204 -> null
    renderNavBar();

    await userEvent.click(screen.getByRole("link", { name: "Logout" }));

    expect(apiFetch).toHaveBeenCalledWith("/auth/jwt/logout", { method: "POST" });
    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith({});
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("does not clear auth or redirect if logout does not return null", async () => {
    apiFetch.mockResolvedValue({ some: "body" });
    renderNavBar();

    await userEvent.click(screen.getByRole("link", { name: "Logout" }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    expect(mockSetAuth).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("alerts on logout failure", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    apiFetch.mockRejectedValue(new Error("boom"));
    renderNavBar();

    await userEvent.click(screen.getByRole("link", { name: "Logout" }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith("boom"));
    expect(mockNavigate).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
