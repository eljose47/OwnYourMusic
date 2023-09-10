import * as React from "react";
import { Cell, Grid, HeaderCell } from "./localFiles";

const Spotify: React.FunctionComponent<SpotifyProps> = (props) => {
  const [playlist, setPlaylists] = React.useState();
  const [tracks, setTracks] = React.useState<SpotifyApi.SavedTrackObject[]>();

  const getPlaylistsRef = React.useRef<Promise<any>>();
  React.useEffect(() => {
    getPlaylistsRef.current ??= window.electronAPI.getSpotifyStuff();
    getPlaylistsRef.current.then(({ playlists, tracks }) => {
      setPlaylists(playlists);
      setTracks(tracks);
    });
  }, []);

  React.useEffect(() => console.log("tracks", tracks), [tracks]);

  if (!playlist && !tracks) {
    return null;
  }

  return (
    <Grid>
      <HeaderCell>Track</HeaderCell>
      <HeaderCell>Album</HeaderCell>
      <HeaderCell>Artist</HeaderCell>
      <HeaderCell>Other Artists</HeaderCell>
      <HeaderCell>Genres</HeaderCell>
      <HeaderCell>Release Date</HeaderCell>
      {tracks?.map(
        ({
          track: {
            artists: [artist, ...otherArtists],
            ...track
          },
        }) => (
          <React.Fragment key={track.id}>
            <Cell>{track.name}</Cell>
            <Cell>{track.album.name}</Cell>
            <Cell>{artist.name}</Cell>
            <Cell>{otherArtists.map((oA) => oA.name).join(", ")}</Cell>
            <Cell>{}</Cell>
            <Cell>{}</Cell>
          </React.Fragment>
        )
      )}
    </Grid>
  );
};

Spotify.displayName = "Spotify";

export default Spotify;

export interface SpotifyProps {}
