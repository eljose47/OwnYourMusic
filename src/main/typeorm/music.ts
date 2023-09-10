import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Relation,
  TableForeignKey,
  Unique,
} from "typeorm";

@Entity()
// @Unique(["albumId", "name"])
export class Track {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true, nullable: true })
  isrc?: string;

  @Column()
  name: string;

  albumId: string;
  @ManyToOne((type) => Album, (album) => album.tracks, { cascade: true })
  album: Relation<Album>;

  @ManyToMany((type) => Artist, (artist) => artist.tracks)
  @JoinTable()
  artists: Relation<Artist>[];

  @Column({ nullable: true })
  releaseDate?: Date;

  @ManyToMany((type) => Genre, (genre) => genre.relatedTracks)
  @JoinTable()
  genres: Relation<Genre>[];

  @OneToMany((type) => TrackServiceReference, (ref) => ref.track, {
    cascade: true,
  })
  serviceRefs: Relation<TrackServiceReference>[];
}

@Entity()
export class TrackServiceReference {
  @Column()
  type: string;

  @PrimaryColumn()
  serviceId: string;

  @ManyToOne((type) => Track, (track) => track.serviceRefs)
  track: Relation<Track>;
}

@Entity()
export class Genre {
  @PrimaryColumn()
  name: string;

  @ManyToMany((type) => Track, (track) => track.genres)
  relatedTracks: Relation<Track>[];
}

@Entity()
@Unique(["fileReference"])
// @Unique(["name", "artistId"])
export class Album {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @ManyToOne((type) => Artist, (artist) => artist.albums, { cascade: true })
  artist: Relation<Artist>;

  @OneToMany((type) => Track, (track) => track.album)
  tracks: Relation<Track>[];

  @Column({ nullable: true })
  fileReference?: string;

  @Column({ nullable: true, unique: true })
  spotifyId?: string;

  @OneToMany((type) => AlbumServiceReference, (ref) => ref.album, {
    cascade: true,
  })
  serviceRefs: Relation<AlbumServiceReference>[];
}

@Entity()
export class AlbumServiceReference {
  @Column()
  type: string;

  @PrimaryColumn()
  serviceId: string;

  @ManyToOne((type) => Album, (album) => album.serviceRefs)
  album: Relation<Album>;
}

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  spotifyId?: string;

  @ManyToMany((type) => Track, (track) => track.artists)
  tracks: Relation<Track>[];

  @OneToMany((type) => Album, (track) => track.artist)
  albums: Relation<Album>[];

  @OneToMany((type) => ArtistServiceReference, (ref) => ref.artist, {
    cascade: true,
  })
  serviceRefs: Relation<ArtistServiceReference>[];
}

@Entity()
export class ArtistServiceReference {
  @Column()
  type: string;

  @PrimaryColumn()
  serviceId: string;

  @ManyToOne((type) => Artist, (artist) => artist.serviceRefs)
  artist: Relation<Artist>;
}
