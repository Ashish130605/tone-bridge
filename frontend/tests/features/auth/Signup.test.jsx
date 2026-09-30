import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, Navigate: ({ to }) => <div data-testid="navigate">{to}</div> };
});
vi.mock("../../../src/lib/api-client", () => ({ apiFetch: vi.fn() }));

import { SignUp } from "../../../src/features/auth/components/Signup";
import { apiFetch } from "../../../src/lib/api-client";

const EMAIL = "user@example.com";
const PASSWORD = "Str0ng@Pass";

function renderSignup() {
  return render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );
}

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText("Email"), EMAIL);
  await userEvent.type(screen.getByLabelText("Password"), PASSWORD);
  await userEvent.type(screen.getByLabelText("Confirm Password"), PASSWORD);
}

describe("SignUp", () => {
  beforeEach(() => vi.clearAllMocks());

  it("disables the submit button until email, password and confirm are all valid", async () => {
    renderSignup();
    const submit = screen.getByRole("button", { name: "Submit" });
    expect(submit).toBeDisabled();

    await fillValidForm();
    await waitFor(() => expect(submit).toBeEnabled());
  });

  it("keeps submit disabled when the confirm password does not match", async () => {
    renderSignup();
    await userEvent.type(screen.getByLabelText("Email"), EMAIL);
    await userEvent.type(screen.getByLabelText("Password"), PASSWORD);
    await userEvent.type(screen.getByLabelText("Confirm Password"), "Different1!");

    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("registers with a JSON body and redirects to /login on success", async () => {
    apiFetch.mockResolvedValue(null);
    renderSignup();
    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(apiFetch).toHaveBeenCalledTimes(1);
    const [path, options] = apiFetch.mock.calls[0];
    expect(path).toBe("/auth/register");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ email: EMAIL, password: PASSWORD });

    await waitFor(() =>
      expect(screen.getByTestId("navigate")).toHaveTextContent("/login")
    );
  });

  it("shows the server error message when registration fails", async () => {
    apiFetch.mockRejectedValue(new Error("409"));
    renderSignup();
    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("409")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });
});
