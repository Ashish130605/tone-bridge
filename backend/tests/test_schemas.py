from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.schemas import Song, SongsSuggestion, UserHistory


def suggestion_row(**overrides):
    """A Songs-table-like row (uses the DB column names)."""
    data = dict(
        song_title="Isn't She Lovely",
        artists="Stevie Wonder",
        album_name="Songs in the Key of Life",
        spotify_url="https://open.spotify.com/track/abc",
    )
    data.update(overrides)
    return SimpleNamespace(**data)


def event_row(**overrides):
    """A ListeningEvents-table-like row (uses the API field names)."""
    data = dict(
        title="As",
        artist="Stevie Wonder",
        album="Songs in the Key of Life",
        release_year=1976,
        other_links="https://lis.tn/as",
        apple_link="https://music.apple.com/x",
        spotify_link="https://open.spotify.com/track/xyz",
    )
    data.update(overrides)
    return SimpleNamespace(**data)


class TestSongsSuggestion:
    def test_maps_db_column_names_to_api_fields(self):
        model = SongsSuggestion.model_validate(suggestion_row())

        assert model.title == "Isn't She Lovely"
        assert model.artist == "Stevie Wonder"
        assert model.album == "Songs in the Key of Life"
        assert model.spotify_link == "https://open.spotify.com/track/abc"

    def test_missing_source_column_raises(self):
        row = suggestion_row()
        del row.song_title
        with pytest.raises(ValidationError):
            SongsSuggestion.model_validate(row)


class TestSong:
    def test_builds_from_event_like_object(self):
        model = Song.model_validate(event_row())

        assert model.title == "As"
        assert model.artist == "Stevie Wonder"
        assert model.release_year == 1976
        assert model.other_links == "https://lis.tn/as"

    def test_album_cover_and_suggestions_have_defaults(self):
        model = Song.model_validate(event_row())

        assert model.album_cover_url is None
        assert model.suggestions == []

    def test_optional_links_accept_none(self):
        model = Song.model_validate(
            event_row(apple_link=None, spotify_link=None, other_links=None)
        )

        assert model.apple_link is None
        assert model.spotify_link is None
        assert model.other_links is None

    def test_release_year_coerces_numeric_string(self):
        model = Song.model_validate(event_row(release_year="1976"))
        assert model.release_year == 1976

    def test_non_numeric_release_year_raises(self):
        with pytest.raises(ValidationError):
            Song.model_validate(event_row(release_year="not-a-year"))

    def test_missing_required_field_raises(self):
        row = event_row()
        del row.title
        with pytest.raises(ValidationError):
            Song.model_validate(row)


class TestUserHistory:
    def test_builds_from_event_like_object(self):
        model = UserHistory.model_validate(event_row())

        assert model.title == "As"
        assert model.artist == "Stevie Wonder"
        assert model.album == "Songs in the Key of Life"
        assert model.release_year == 1976
        assert model.other_links == "https://lis.tn/as"

    def test_optional_links_accept_none(self):
        model = UserHistory.model_validate(
            event_row(apple_link=None, spotify_link=None, other_links=None)
        )

        assert model.apple_link is None
        assert model.spotify_link is None
        assert model.other_links is None

    def test_missing_required_field_raises(self):
        row = event_row()
        del row.artist
        with pytest.raises(ValidationError):
            UserHistory.model_validate(row)
