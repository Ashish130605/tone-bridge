import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocked recorder: HomePage drives it, so we control start/stop and isRecording.
const { recorder } = vi.hoisted(() => ({
  recorder: { isRecording: false, error: "", start: vi.fn(), stop: vi.fn() },
}));
vi.mock("../src/hooks/useRecorder", () => ({ useRecorder: () => recorder }));
vi.mock("../src/lib/api-client", () => ({ apiFetch: vi.fn() }));

import { HomePage } from "../src/features/identify/components/HomePage";
import { apiFetch } from "../src/lib/api-client";

const RESULT = {
  title: "As",
  artist: "Stevie Wonder",
  album: "Songs in the Key of Life",
  album_cover_url: "https://img.test/cover.jpg",
  spotify_link: "https://open.spotify.com/track/xyz",
  apple_link: "https://music.apple.com/track/xyz",
  other_links: "https://lis.tn/as",
  suggestions: [
    { title: "Isn't She Lovely", artist: "Stevie Wonder", album: "Songs in the Key of Life" },
  ],
};

beforeEach(() => {
  recorder.isRecording = false;
  recorder.error = "";
  recorder.start.mockReset();
  recorder.stop.mockReset();
  apiFetch.mockReset();
});

describe("HomePage", () => {
  it("starts recording when the record button is clicked", async () => {
    render(<HomePage />);
    await userEvent.click(screen.getByRole("button"));
    expect(recorder.start).toHaveBeenCalledTimes(1);
  });

  it("identifies the song on stop: uploads the clip and shows the result + suggestions", async () => {
    recorder.isRecording = true; // simulate an in-progress recording
    recorder.stop.mockResolvedValue(new Blob(["audio"], { type: "audio/wav" }));
    apiFetch.mockResolvedValue(RESULT);

    render(<HomePage />);
    await userEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(screen.getByText("Song identified")).toBeInTheDocument()
    );
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/recognise",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) })
    );
    expect(screen.getByText("As")).toBeInTheDocument();
    expect(screen.getByText("Isn't She Lovely")).toBeInTheDocument();
  });

  it("shows the loading state while the request is in flight", async () => {
    recorder.isRecording = true;
    recorder.stop.mockResolvedValue(new Blob(["audio"]));
    let resolveFetch;
    apiFetch.mockReturnValue(new Promise((res) => (resolveFetch = res)));

    const { container } = render(<HomePage />);
    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(container.querySelector(".loader")).toBeInTheDocument());

    resolveFetch(RESULT);
    await waitFor(() =>
      expect(screen.getByText("Song identified")).toBeInTheDocument()
    );
  });

  it("shows an error message when identification fails", async () => {
    recorder.isRecording = true;
    recorder.stop.mockResolvedValue(new Blob(["audio"]));
    apiFetch.mockRejectedValue(new Error("Could not recognise the audio."));

    render(<HomePage />);
    await userEvent.click(screen.getByRole("button"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not recognise the audio."
    );
    expect(screen.queryByText("Song identified")).not.toBeInTheDocument();
  });

  it("surfaces a recorder (microphone) error", () => {
    recorder.error = "Permission denied";
    render(<HomePage />);
    expect(screen.getByRole("alert")).toHaveTextContent("Permission denied");
  });

  it("resets back to the record screen when Guess Again is clicked", async () => {
    recorder.isRecording = true;
    recorder.stop.mockResolvedValue(new Blob(["audio"]));
    apiFetch.mockResolvedValue(RESULT);

    render(<HomePage />);
    await userEvent.click(screen.getByRole("button"));
    await screen.findByText("Song identified");

    await userEvent.click(screen.getByRole("button", { name: "Guess Again" }));
    expect(screen.queryByText("Song identified")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument(); // record button back
  });
});
