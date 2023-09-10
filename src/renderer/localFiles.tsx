import * as React from "react";
import type { Track } from "../main/typeorm/music";
import styled from "styled-components";

const Inline = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, auto);
  justify-items: center;
  align-items: center;

  column-gap: 6px;
`;
export const Cell = styled.div`
  display: width;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const HeaderCell = styled(Cell)`
  font-weight: 600;
`;

const LocalFiles: React.FunctionComponent<LocalFilesProps> = (props) => {
  const [tracks, setTracks] = React.useState<Track[] | undefined>();

  React.useEffect(() => {
    window.electronAPI.getAllTracks?.()?.then((tracks) => setTracks(tracks));
  }, []);

  return (
    <div>
      <Inline>
        <h1>Local Files</h1>
        <button
          onClick={async () => {
            await window.electronAPI.doStuff();
            const tracks = await window.electronAPI.getAllTracks();
            setTracks(tracks);
          }}
        >
          Scan Files
        </button>
      </Inline>
      {/* <>{JSON.stringify(tracks, undefined, "\t")}</div> */}
      <Grid>
        <HeaderCell>Track</HeaderCell>
        <HeaderCell>Album</HeaderCell>
        <HeaderCell>Artist</HeaderCell>
        <HeaderCell>Other Artists</HeaderCell>
        <HeaderCell>Genres</HeaderCell>
        <HeaderCell>Release Date</HeaderCell>
        {tracks?.map((track) => {
          const [artist, ...otherArtists] = track.artists?.length
            ? track.artists.map((artist) => artist.name)
            : track.fileReference?.artists ?? [];
          const album = track.album?.name ?? track.fileReference?.album;

          return (
            <>
              <Cell>{track.name}</Cell>
              <Cell>{album}</Cell>
              <Cell>{artist}</Cell>
              <Cell>{otherArtists.join(", ")}</Cell>
              <Cell>{track.genres?.join(", ")}</Cell>
              {/* <Cell>{track.releaseDate}</Cell> */}
              <Cell></Cell>
            </>
          );
        })}
      </Grid>
    </div>
  );
};

LocalFiles.displayName = "LocalFiles";

export default LocalFiles;

export interface LocalFilesProps {
  children?: React.ReactNode;
}
