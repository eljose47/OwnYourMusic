import { BrowserWindow } from "electron";
import SpotifyWebApi from "spotify-web-api-node";
import { AppDataSource } from "../typeorm";
import { Session } from "../typeorm/auth";
import {
  GenericServiceWithAuthentication,
  Track as ClientTrack,
  SearchForTrackParams,
} from "./base";

const sessionRepo = AppDataSource.getRepository(Session);

type AuthResponse = Awaited<
  ReturnType<SpotifyWebApi["authorizationCodeGrant"]>
>["body"];

export class Spotify implements GenericServiceWithAuthentication {
  type = "spotify" as const;
  isAuthenticated: boolean;
  private apiClient: SpotifyWebApi;

  constructor() {
    this.apiClient = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: "http://localhost:3000",
    });
  }

  async startAuthFlow() {
    const url = this.apiClient.createAuthorizeURL(["user-library-read"], "");
    const authWindow = new BrowserWindow({});

    const code = await new Promise<string>((res, rej) => {
      authWindow.webContents.on("will-navigate", (event, newUrl) => {
        const url = new URL(newUrl);

        const code = url.searchParams.get("code");
        if (code) {
          res(code);
          authWindow.close();
        }
        const error = url.searchParams.get("error");
        if (error) {
          rej(error);
          authWindow.close();
        }
      });

      authWindow.webContents.on("will-redirect", (event, newUrl) => {
        const url = new URL(newUrl);

        const code = url.searchParams.get("code");
        if (code) {
          res(code);
          authWindow.close();
        }
        const error = url.searchParams.get("error");
        if (error) {
          rej(error);
          authWindow.close();
        }
      });
      authWindow.loadURL(url);
    });

    const { body: tokens } = await this.apiClient.authorizationCodeGrant(code);
    this.apiClient.setAccessToken(tokens.access_token);
    this.apiClient.setRefreshToken(tokens.refresh_token);
    await this.storeSessionInDb(tokens);
  }

  async getSessionFromDb(): Promise<AuthResponse | undefined> {
    // async getSessionFromDb(): Promise<AuthResponse | undefined> {
    // const dbSession = await Session.findByPk("Spotify");
    const dbSession = await sessionRepo.findOne({
      where: { type: "Spotify" },
    });

    if (!dbSession) {
      return;
    }

    this.apiClient.setAccessToken(dbSession.access_token);
    this.apiClient.setRefreshToken(dbSession.refresh_token);
    let expiryDateNum = new Date(dbSession.expires_in).valueOf();

    if (expiryDateNum < Date.now()) {
      const { body: tokenSet } = await this.apiClient.refreshAccessToken();
      // if(tokenSet && "refresh_token" in tokenSet && "access_token" in tokenSet)

      this.apiClient.setAccessToken(tokenSet.access_token);
      // this.setRefreshToken(tokenSet.refresh_token);
      expiryDateNum = Date.now() + tokenSet.expires_in;

      dbSession.access_token = tokenSet.access_token;
      dbSession.refresh_token = tokenSet.refresh_token;
      dbSession.expires_in = new Date(expiryDateNum);

      sessionRepo.save(dbSession);
    }

    return {
      ...dbSession,
      expires_in: expiryDateNum,
    };
  }

  async storeSessionInDb(auth: AuthResponse) {
    await sessionRepo.upsert(
      {
        type: "Spotify",
        ...auth,
        expires_in: new Date(auth.expires_in),
      },
      ["type"]
    );
  }

  async authorize() {
    const auth = await this.getSessionFromDb();

    if (!auth) {
      await this.startAuthFlow();
    }

    this.isAuthenticated = true;
  }

  private convertSpotifyTrack(track: SpotifyApi.TrackObjectFull): ClientTrack {
    return {
      title: track.name,
      isrc: track.external_ids.isrc,
      serviceId: track.id,
      album: {
        title: track.album.name,
        serviceId: track.album.id,
        artists: track.album.artists.map((a) => ({
          title: a.name,
          serviceId: a.id,
        })),
      },
      artists: track.artists.map((a) => ({ title: a.name, serviceId: a.id })),
    };
  }

  async getSavedTracks(): Promise<ClientTrack[]> {
    const tracks: SpotifyApi.SavedTrackObject[] = [];
    const limit = 50;

    const firstResponse = await this.apiClient.getMySavedTracks({
      limit,
      offset: 0,
    });

    const length = tracks.push(...firstResponse.body.items);
    const totalItems = firstResponse.body.total;

    if (length < limit) {
      const requests = [];
      for (let i = limit; i < totalItems; i += limit) {
        requests.push(
          this.apiClient.getMySavedTracks({ limit: limit, offset: i })
        );
      }

      const responses = await Promise.all(requests);
      tracks.push(...responses.map((r) => r.body.items).flat());
    }

    return tracks.map(({ track }) => this.convertSpotifyTrack(track));
  }

  async searchForTrack(params: SearchForTrackParams): Promise<ClientTrack[]> {
    let query = `track:${params.track}`;
    if (params.artist) {
      query += ` artist:${params.artist}`;
    }
    if (params.album) {
      query += ` album:${params.album}`;
    }

    const response = await this.apiClient.searchTracks(query);

    return response.body.tracks!.items.map((track) =>
      this.convertSpotifyTrack(track)
    );
  }
}
