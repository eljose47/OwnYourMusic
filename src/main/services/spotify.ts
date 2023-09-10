import { BrowserView, BrowserWindow } from "electron";
import SpotifyWebApi from "spotify-web-api-node";
import {
  AppDataSource,
  albumRepository,
  artistRepository,
  trackRepository,
} from "../typeorm";
import { Session } from "../typeorm/auth";
import { Track } from "../typeorm/music";

const sessionRepo = AppDataSource.getRepository(Session);

type AuthResponse = Awaited<
  ReturnType<SpotifyWebApi["authorizationCodeGrant"]>
>["body"];

export class Spotify extends SpotifyWebApi {
  constructor() {
    super({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: "http://localhost:3000",
    });
  }

  async startAuthFlow() {
    const url = this.createAuthorizeURL(["user-library-read"], "");
    console.log("url", url);

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

    const { body: tokens } = await this.authorizationCodeGrant(code);
    this.setAccessToken(tokens.access_token);
    this.setRefreshToken(tokens.refresh_token);
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

    this.setAccessToken(dbSession.access_token);
    this.setRefreshToken(dbSession.refresh_token);
    let expiryDateNum = new Date(dbSession.expires_in).valueOf();

    if (expiryDateNum < Date.now()) {
      const { body: tokenSet } = await this.refreshAccessToken();
      // if(tokenSet && "refresh_token" in tokenSet && "access_token" in tokenSet)

      this.setAccessToken(tokenSet.access_token);
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
      return;
    }
  }

  async getAllSavedTracks(): Promise<SpotifyApi.SavedTrackObject[]> {
    const tracks: SpotifyApi.SavedTrackObject[] = [];
    const limit = 50;

    const firstResponse = await this.getMySavedTracks({ limit, offset: 0 });

    const length = tracks.push(...firstResponse.body.items);
    const totalItems = firstResponse.body.total;

    if (length < limit) {
      return tracks;
    }

    const requests = [];
    for (let i = limit; i < totalItems; i += limit) {
      requests.push(this.getMySavedTracks({ limit: limit, offset: i }));
    }

    const responses = await Promise.all(requests);
    tracks.push(...responses.map((r) => r.body.items).flat());
    return tracks;
  }

  async syncWithDb() {
    const tracks = await this.getAllSavedTracks();
    await Promise.all(
      tracks.map(async ({ track }) => {
        let trackRecord = await trackRepository.findOne({
          where: [
            {
              spotifyId: track.id,
            },
            {
              name: track.name,
              fileReference: {
                album: track.album.name,
                artists: track.artists[0].name,
              },
            },
          ],
          relations: { fileReference: true },
        });

        if (!trackRecord) {
          trackRecord = new Track();
          trackRecord.name = track.name;
          trackRecord.releaseDate = new Date(track.album.release_date);

          await Promise.all(
            track.artists.map((artist) =>
              artistRepository.upsert(
                { name: artist.name, spotifyId: artist.id },
                ["spotifyId"]
              )
            )
          );

          await albumRepository.upsert(
            {
              name: track.album.name,
              spotifyId: track.album.id,
            },
            ["spotifyId"]
          );
        }

        trackRecord.spotifyId = track.id;
        await trackRepository.save(trackRecord);
      })
    );
  }
}
