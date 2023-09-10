import { dialog, ipcMain } from "electron";
import { crawlDirectory } from "./crawler";
import { AppDataSource } from "./typeorm";
import { Track } from "./typeorm/music";
import { Spotify } from "./services/spotify";
import {
  GenericService,
  GenericServiceWithAuthentication,
  ServiceType,
} from "./services/base";

export function createIpcListeners() {
  const services: { [key in ServiceType]: GenericService } = {
    spotify: new Spotify(),
  };

  let mainService: GenericService = services.spotify;

  ipcMain.handle("doStuff", async (event, ...args) => {
    // console.log("on doStuff");
    // await doStuff();
    const dir = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    await crawlDirectory(dir.filePaths[0], mainService);
  });

  ipcMain.handle("getAllTracks", async (event, ...args) => {
    const trackRepository = AppDataSource.getRepository(Track);

    const tracks = await trackRepository.find({
      where: { serviceRefs: { type: "local" } },
      relations: { serviceRefs: true, album: true, artists: true },
    });

    return tracks;
    // const values = tracks.map((t) => t.toJSON());
    // return values;
  });

  ipcMain.handle("authenticateSpotify", async (event, ...args) => {
    await (services.spotify as GenericServiceWithAuthentication).authorize();

    return "ok";
  });

  ipcMain.handle("getSavedTracks", async (event, type: ServiceType) => {
    const tracks = await services[type].getSavedTracks();

    return { tracks };
  });
}
