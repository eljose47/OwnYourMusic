export interface Track {
  title: string;
  serviceId: string;
  isrc?: string;
  artists: Artist[];
  album: Album;
}

export interface Album {
  title: string;
  serviceId: string;
  artists: Artist[];
}

export interface Artist {
  title: string;
  serviceId: string;
}

export interface SearchForTrackParams {
  track: string;
  artist?: string;
  album?: string;
}

export type ServiceType = "spotify";
export abstract class GenericService {
  abstract type: ServiceType;

  abstract searchForTrack(params: SearchForTrackParams): Promise<Track[]>;

  abstract getSavedTracks(): Promise<Track[]>;
}

export abstract class GenericServiceWithAuthentication extends GenericService {
  abstract isAuthenticated: boolean;

  abstract authorize(): any;
}
