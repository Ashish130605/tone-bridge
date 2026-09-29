import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

const mockSetAuth = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, Navigate: ({ to }) => <div data-testid="navigate">{to}</div> };
});
vi.mock("../src/hooks/useAuth", () => ({
  default: () => ({ setAuth: mockSetAuth }),
}));
vi.mock("../src/lib/api-client", () => ({ apiFetch: vi.fn() }));

import { Login } from "../src/features/auth/components/Login";
import { apiFetch } from "../src/lib/api-client";

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe("Login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the form and focuses the email field on mount", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveFocus();
  });

  it("submits credentials as URL-encoded form data and redirects on success", async () => {
    apiFetch.mockResolvedValue(null); // 204 -> null
    renderLogin();

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "Str0ng@Pass");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(apiFetch).toHaveBeenCalledTimes(1);
    const [path, options] = apiFetch.mock.calls[0];
    expect(path).toBe("/auth/jwt/login");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(URLSearchParams);
    expect(options.body.get("username")).toBe("user@example.com");
    expect(options.body.get("password")).toBe("Str0ng@Pass");

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith({ email: "user@example.com" });
      expect(screen.getByTestId("navigate")).toHaveTextContent("/");
    });
  });

  it("shows an error message on 400 (bad credentials)", async () => {
    apiFetch.mockRejectedValue(new Error("400"));
    renderLogin();

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("Email or password is incorrect.")
    ).toBeInTheDocument();
    expect(mockSetAuth).not.toHaveBeenCalled();
  });
});
