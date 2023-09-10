interface Track {
  title: string;
  isrc?: string;
  artists: Artist[];
  album: Album;
}

interface Album {
  title: string;
  artists: Artist[];
}

interface Artist {
  title: string;
}

export abstract class GenericService {
  abstract searchForTrack(): Track[];
}
