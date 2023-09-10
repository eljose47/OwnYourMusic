// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import type { Track } from "./main/typeorm/music";
import type { ServiceType } from "./main/services/base";

interface ElectronApi {
  doStuff(): Promise<any>;
  getAllTracks(): Promise<Track[]>;
  getGoogleSession(): Promise<any>;
  getGoogleStuff(): Promise<any>;
  getSpotifyStuff: () => Promise<{
    tracks: SpotifyApi.SavedTrackObject[];
    playlists: any;
  }>;
  authenticate: {
    spotify(): any;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}

contextBridge.exposeInMainWorld("electronAPI", {
  doStuff: () => ipcRenderer.invoke("doStuff"),
  getAllTracks: () => ipcRenderer.invoke("getAllTracks"),
  getGoogleSession: () => ipcRenderer.invoke("getGoogleSession"),
  getGoogleStuff: () => ipcRenderer.invoke("getGoogleStuff"),
  getSavedTracks: (type: ServiceType) =>
    ipcRenderer.invoke("getSpotifyStuff", type),
  authenticate: {
    spotify: () => ipcRenderer.invoke("authenticateSpotify"),
  },
});
