import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FormField } from "../src/components/FormField";

describe("FormField", () => {
  it("associates the label with the input via id/htmlFor", () => {
    render(<FormField id="email" label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "email");
  });

  it("forwards input props (type, placeholder, required)", () => {
    render(
      <FormField
        id="pwd"
        label="Password"
        type="password"
        placeholder="Enter password"
        required
      />
    );
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("placeholder", "Enter password");
    expect(input).toBeRequired();
  });

  it("renders an icon only when the icon prop is provided", () => {
    const { container, rerender } = render(<FormField id="a" label="No icon" />);
    expect(container.querySelector("svg")).toBeNull();

    rerender(<FormField id="a" label="With icon" icon={faEnvelope} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("shows the note text with the instructions class when showNote is true", () => {
    render(
      <FormField
        id="email"
        label="Email"
        noteid="emailnote"
        note="Please enter a valid email."
        showNote={true}
      />
    );
    const note = screen.getByText("Please enter a valid email.");
    expect(note).toHaveAttribute("id", "emailnote");
    expect(note).toHaveClass("instructions");
  });

  it("hides the note (offscreen class) when showNote is false", () => {
    render(
      <FormField id="email" label="Email" note="hint text" showNote={false} />
    );
    expect(screen.getByText("hint text")).toHaveClass("offscreen");
  });

  it("renders no note element when no note prop is given", () => {
    const { container } = render(<FormField id="email" label="Email" />);
    expect(container.querySelector("p")).toBeNull();
  });
});
