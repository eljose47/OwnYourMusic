import { DataSource } from "typeorm";
import { Storage } from "../storage";
import { Album, Artist, File, Genre, Track } from "./music";
import { Session } from "./auth";

const storage = new Storage();
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: storage.resolvePath("./data.db"),
  entities: [Track, Album, Artist, Genre, File, Session],
  synchronize: true,
});

export const trackRepository = AppDataSource.getRepository(Track);
export const albumRepository = AppDataSource.getRepository(Album);
export const artistRepository = AppDataSource.getRepository(Artist);
export const genreRepository = AppDataSource.getRepository(Genre);
export const fileRepository = AppDataSource.getRepository(File);
export const sessionRepository = AppDataSource.getRepository(Session);
