import * as fs from "fs/promises";
// eslint-disable-next-line import/no-unresolved
import { IAudioMetadata, ICommonTagsResult, parseFile } from "music-metadata";
import * as path from "path";
import { Storage } from "./storage";
import {
  Album,
  AlbumTrackRelation,
  Artist,
  ArtistAlbumRelation,
  Track,
  ArtistTrackRelation,
  sequelize,
  TrackArtistRelation,
  AlbumArtistRelation,
  TrackAlbumRelation,
} from "./sequelize";
import { AppDataSource } from "./typeorm";
import {
  Track as TTrack,
  Album as TAlbum,
  Artist as TArtist,
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

      const mbTrack = await musicbrainz.findTrack({
        track: title,
        artist,
        album,
      });

      let tArtists: TArtist[];

      if (mbTrack) {
        tArtists = await Promise.all(
          mbTrack["artist-credit"].map(async ({ artist }) => {
            let tArtist = await artistRepository.findOne({
              where: { mbId: artist.id },
              relations: { albums: true, tracks: true },
            });

            if (tArtist) {
              return tArtist;
            }

            tArtist = new TArtist();
            tArtist.name = artist.name;
            tArtist.mbId = artist.id;

            await artistRepository.save(tArtist);
            return tArtist;
          })
        );
      } else {
        tArtists = await Promise.all(
          artists.map(async (artist) => {
            let tArtist = await artistRepository.findOne({
              where: { name: artist, albums: { name: album } },
              relations: { albums: true, tracks: true },
            });

            if (tArtist) {
              return tArtist;
            }

            tArtist = new TArtist();
            tArtist.name = artist;

            await artistRepository.save(tArtist);
            return tArtist;
          })
        );
      }

      if (!talbum) {
        const mbAlbumId = mbTrack?.releases?.[0]?.["release-group"]?.id;
        talbum = await albumRepository.findOne({
          where: [{ mbId: mbAlbumId }, { fileReference: dirPath }],
          relations: { tracks: true, artist: true },
        });

        if (!talbum) {
          talbum = new TAlbum();
          talbum.name = album;
          talbum.fileReference = dirPath;
          talbum.artist = tArtists[0];
          talbum.mbId = mbAlbumId;

          await albumRepository.save(talbum);
        }
      }

      let ttrack = await trackRepository.findOne({
        where: [
          { mbId: mbTrack?.id },
          {
            name: title,
            album: { name: album },
            artists: artists.map((a) => ({
              name: a,
            })),
          },
          {
            fileReference: newPath,
          },
        ],
        relations: { artists: true, album: true },
      });

      if (!ttrack) {
        ttrack = new TTrack();
        ttrack.name = title;
        ttrack.releaseDate = new Date(date);
        ttrack.fileReference = newPath;
        ttrack.album = talbum;
        ttrack.artists = tArtists;
        ttrack.mbId = mbTrack?.id;

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
