import { DataSource } from "typeorm";
import { Storage } from "../storage";
import {
  Album,
  AlbumServiceReference,
  Artist,
  ArtistServiceReference,
  Genre,
  Track,
  TrackServiceReference,
} from "./music";
import { Session } from "./auth";

const storage = new Storage();
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: storage.resolvePath("./data.db"),
  entities: [
    Track,
    Album,
    Artist,
    Genre,
    Session,
    ArtistServiceReference,
    AlbumServiceReference,
    TrackServiceReference,
  ],
  synchronize: true,
});

export const trackRepository = AppDataSource.getRepository(Track);
export const albumRepository = AppDataSource.getRepository(Album);
export const artistRepository = AppDataSource.getRepository(Artist);
export const artistservicereferenceRepository = AppDataSource.getRepository(
  ArtistServiceReference
);
export const genreRepository = AppDataSource.getRepository(Genre);
export const sessionRepository = AppDataSource.getRepository(Session);
