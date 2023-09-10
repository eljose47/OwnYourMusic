import {
  IBrowseRecordingsResult,
  IRecording,
  ISearchResult,
  MusicBrainzApi,
} from "musicbrainz-api";

const mbApi = new MusicBrainzApi({
  appName: "ownYourMusic",
});

interface IRecordingsReult extends ISearchResult {
  recordings: IRecording[];
}

export class MusicBrainz extends MusicBrainzApi {
  lastRequest = 0;
  queueRunning = false;
  requestQueue: Array<() => Promise<any>> = [];

  constructor() {
    super({
      appName: "ownYourMusic",
    });
  }

  async waitForCooldown() {
    const diff = Date.now() - this.lastRequest;
    if (diff < 1000) {
      await new Promise<void>((res) => setTimeout(() => res(), diff));
    }

    this.lastRequest = Date.now();
  }

  queueAndAwaitRequest<T extends (...args: any[]) => any>(
    request: T
  ): Promise<ReturnType<T>> {
    return new Promise<ReturnType<T>>((res, rej) => {
      this.requestQueue.push(async () => {
        const output = await request();
        res(output);
      });
      this.workQueue();
    });
  }

  async workQueue() {
    if (this.queueRunning) {
      return;
    }
    this.queueRunning = true;
    const next = this.requestQueue.shift();
    if (!next) {
      this.queueRunning = false;
      return;
    }

    await this.waitForCooldown();
    await next();

    if (this.requestQueue.length) {
      this.workQueue();
    } else {
      this.queueRunning = false;
    }
  }

  async findTrack(input: {
    track: string;
    artist?: string;
    album?: string;
  }): Promise<IRecording | undefined> {
    let query = `${input.track}`;

    if (input.artist) {
      query += ` AND artist:${input.artist}`;
    }
    if (input.album) {
      query += ` AND release-group:${input.album}`;
    }

    const {
      recordings: [track],
    } = await this.queueAndAwaitRequest(() =>
      this.search<IRecordingsReult>("recording", {
        query,
        limit: 1,
      })
    );

    return track;
  }
}

// query limit von 1 query / second
// https://musicbrainz.org/ws/2/recording/?query=Exploder AND artist:Audioslave AND release:Audioslave
