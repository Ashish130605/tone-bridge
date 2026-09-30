import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Loading } from "../../src/components/Loading";

describe("Loading", () => {
  it("renders the loader element", () => {
    const { container } = render(<Loading />);
    expect(container.querySelector(".loader")).toBeInTheDocument();
  });
});
