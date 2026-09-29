import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SongCard } from "../src/components/SongCard";

const song = {
  title: "As",
  artist: "Stevie Wonder",
  album: "Songs in the Key of Life",
  album_cover_url: "https://img.test/cover.jpg",
  spotify_link: "https://open.spotify.com/track/xyz",
  apple_link: "https://music.apple.com/track/xyz",
  other_links: "https://lis.tn/as",
};

describe("SongCard", () => {
  it("renders title, artist and album from data", () => {
    render(<SongCard data={song} />);
    expect(screen.getByText("As")).toBeInTheDocument();
    expect(screen.getByText("Stevie Wonder")).toBeInTheDocument();
    expect(screen.getByText("Songs in the Key of Life")).toBeInTheDocument();
  });

  it("wires the album cover image", () => {
    render(<SongCard data={song} />);
    expect(screen.getByAltText("Album Cover")).toHaveAttribute(
      "src",
      song.album_cover_url
    );
  });

  it("links Spotify / Apple / other platforms to the data URLs", () => {
    render(<SongCard data={song} />);
    expect(screen.getByLabelText("Listen on Spotify")).toHaveAttribute(
      "href",
      song.spotify_link
    );
    expect(screen.getByLabelText("Listen on Apple Music")).toHaveAttribute(
      "href",
      song.apple_link
    );
    expect(screen.getByLabelText("Listen on other platforms")).toHaveAttribute(
      "href",
      song.other_links
    );
  });

  it("applies the variant class", () => {
    const { container } = render(<SongCard variant="listCard" data={song} />);
    const article = container.querySelector("article");
    expect(article).toHaveClass("baseCard");
    expect(article).toHaveClass("listCard");
  });

  it("does not crash when data is undefined", () => {
    expect(() => render(<SongCard />)).not.toThrow();
    expect(screen.getByAltText("Album Cover")).toBeInTheDocument();
  });
});
