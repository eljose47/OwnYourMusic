import * as fs from "fs/promises";
// eslint-disable-next-line import/no-unresolved
import { IAudioMetadata, ICommonTagsResult, parseFile } from "music-metadata";
import * as path from "path";
import { Storage } from "./storage";
import { AppDataSource } from "./typeorm";
import {
  Track as TTrack,
  Album as TAlbum,
  Artist as TArtist,
  File,
} from "./typeorm/music";
import { MusicBrainz } from "./services/musicbrainz";

type Picked = Pick<
  ICommonTagsResult,
  "album" | "artist" | "title" | "track" | "artists" | "date" | "genre"
>;

interface Data extends Picked {
  fileReference: string;
}

type Type = { [key: string]: Type | Data };

const artistRepository = AppDataSource.getRepository(TArtist);
const albumRepository = AppDataSource.getRepository(TAlbum);
const trackRepository = AppDataSource.getRepository(TTrack);

const musicbrainz = new MusicBrainz();

export async function iterate(dirPath: string, fileTypes: string[]) {
  const dir = await fs.opendir(dirPath);

  let talbum: TAlbum;

  for await (const entry of dir) {
    const newPath = path.resolve(dirPath, entry.name);

    if (entry.isFile()) {
      if (!fileTypes.some((fileType) => entry.name.endsWith("." + fileType))) {
        continue;
      }
      const metadata = await parseFile(newPath, {});

      const { artist, artists, genre, album, title, date, track } =
        metadata.common;
      const picked: Picked = {
        artist,
        artists,
        genre,
        album,
        title,
        date,
        track,
      };

      let ttrack = await trackRepository.findOne({
        where: [
          {
            fileReference: { path: newPath },
          },
          {
            name: title,
            album: { name: album },
            artists: artists.map((a) => ({
              name: a,
            })),
          },
        ],
        relations: { artists: true, album: true, fileReference: true },
      });

      if (!ttrack) {
        ttrack = new TTrack();
        ttrack.name = title;
        ttrack.releaseDate = new Date(date);
        ttrack.fileReference = new File();
        ttrack.fileReference.album = album;
        ttrack.fileReference.artists = artists;
        ttrack.fileReference.path = newPath;

        await trackRepository.save(ttrack);
      }
    }
    if (entry.isDirectory()) {
      await iterate(newPath, fileTypes);
      continue;
    }
  }
}

interface crawlOptions {
  /** @default: mp3, wma */
  fileTypes: string[];
}

export async function crawlDirectory(
  dir: string,
  options: crawlOptions = { fileTypes: ["mp3", "wma"] }
) {
  await iterate(dir, options.fileTypes);
}
