import * as fs from "fs/promises";
// eslint-disable-next-line import/no-unresolved
import { ICommonTagsResult, parseFile } from "music-metadata";
import * as path from "path";
import { albumRepository, artistRepository, trackRepository } from "./typeorm";
import {
  Track as TTrack,
  Album as TAlbum,
  Artist as TArtist,
  ArtistServiceReference,
  AlbumServiceReference,
  TrackServiceReference,
} from "./typeorm/music";
import { GenericService } from "./services/base";

type Picked = Pick<
  ICommonTagsResult,
  "album" | "artist" | "title" | "track" | "artists" | "date" | "genre"
>;

interface Data extends Picked {
  fileReference: string;
}

interface crawlOptions {
  /** @default mp3, wma */
  fileTypes: string[];
}

export async function crawlDirectory(
  dir: string,
  onlineService: GenericService,
  options: crawlOptions = { fileTypes: ["mp3", "wma"] }
) {
  async function iterate(dirPath: string, fileTypes: string[]) {
    const dir = await fs.opendir(dirPath);

    let talbum: TAlbum;

    for await (const entry of dir) {
      const newPath = path.resolve(dirPath, entry.name);

      if (entry.isFile()) {
        if (
          !fileTypes.some((fileType) => entry.name.endsWith("." + fileType))
        ) {
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

        const [onlineTrack] = await onlineService.searchForTrack({
          track: title,
          artist,
          album,
        });

        let tArtists: TArtist[];

        if (onlineTrack) {
          tArtists = await Promise.all(
            onlineTrack.artists.map(async (artist) => {
              let tArtist = await artistRepository.findOne({
                where: [
                  {
                    serviceRefs: {
                      type: onlineService.type,
                      serviceId: artist.serviceId,
                    },
                  },
                ],
                relations: { albums: true, tracks: true, serviceRefs: true },
              });

              if (tArtist) {
                return tArtist;
              }

              tArtist = new TArtist();
              tArtist.name = artist.title;
              const serviceRef = new ArtistServiceReference();
              serviceRef.serviceId = artist.serviceId;
              serviceRef.type = onlineService.type;
              tArtist.serviceRefs = [serviceRef];

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
          talbum = await albumRepository.findOne({
            where: [
              onlineTrack
                ? {
                    serviceRefs: {
                      type: onlineService.type,
                      serviceId: onlineTrack.album.serviceId,
                    },
                  }
                : undefined,
              {
                serviceRefs: {
                  type: "local",
                  serviceId: dirPath,
                },
              },
            ],
            relations: { tracks: true, artist: true, serviceRefs: true },
          });

          if (!talbum) {
            talbum = new TAlbum();
            talbum.name = album;
            talbum.fileReference = dirPath;
            talbum.artist = tArtists[0];

            talbum.serviceRefs ??= [];

            if (onlineTrack) {
              const onlineRef = new AlbumServiceReference();
              onlineRef.type = onlineService.type;
              onlineRef.serviceId = onlineTrack.album.serviceId;
              talbum.serviceRefs.push(onlineRef);
            }

            const localRef = new AlbumServiceReference();
            localRef.type = "local";
            localRef.serviceId = dirPath;
            talbum.serviceRefs.push(localRef);

            await albumRepository.save(talbum);
          }
        }

        let ttrack = await trackRepository.findOne({
          where: [
            onlineTrack
              ? {
                  serviceRefs: {
                    type: onlineService.type,
                    serviceId: onlineTrack.serviceId,
                  },
                }
              : undefined,
            {
              name: title,
              album: { name: album },
              artists: artists.map((a) => ({
                name: a,
              })),
            },
            {
              serviceRefs: {
                type: "local",
                serviceId: newPath,
              },
            },
          ],
          relations: { artists: true, album: true, serviceRefs: true },
        });

        if (!ttrack) {
          ttrack = new TTrack();
          ttrack.name = title;
          //Problem: searchResult can already exist in db (isrc Unique Constraint Error)
          //example GreenDay: Boulevard of Broken Dreams / Holiday
          ttrack.isrc = onlineTrack?.isrc;
          ttrack.releaseDate = new Date(date);

          ttrack.album = talbum;
          ttrack.artists = tArtists;

          ttrack.serviceRefs ??= [];

          if (onlineTrack) {
            const onlineRef = new TrackServiceReference();
            onlineRef.type = onlineService.type;
            onlineRef.serviceId = onlineTrack.album.serviceId;
            ttrack.serviceRefs.push(onlineRef);
          }

          const localRef = new TrackServiceReference();
          localRef.type = "local";
          localRef.serviceId = newPath;
          ttrack.serviceRefs.push(localRef);

          await trackRepository.save(ttrack);
        }
      }
      if (entry.isDirectory()) {
        await iterate(newPath, fileTypes);
        continue;
      }
    }
  }

  await iterate(dir, options.fileTypes);
}
