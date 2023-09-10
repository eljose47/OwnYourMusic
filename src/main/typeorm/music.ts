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

  @Column()
  name: string;

  albumId: string;
  @ManyToOne((type) => Album, (album) => album.tracks, { cascade: true })
  album: Relation<Album>;

  @ManyToMany((type) => Artist, (artist) => artist.tracks)
  @JoinTable()
  artists: Relation<Artist>[];

  @Column()
  releaseDate: Date;

  @ManyToMany((type) => Genre, (genre) => genre.relatedTracks)
  @JoinTable()
  genres: Relation<Genre>[];

  @OneToOne((type) => File, (file) => file.track, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  fileReference?: Relation<File>;

  @Column({ nullable: true, unique: true })
  mbId?: string;

  @Column({ nullable: true, unique: true })
  spotifyId?: string;
}

@Entity()
export class File {
  @PrimaryColumn()
  path: string;

  // @Column()
  // type: string;

  @OneToOne((type) => Track, (track) => track.fileReference)
  track: Relation<Track>;

  @Column("json", { nullable: true })
  artists?: string[];

  @Column({ nullable: true })
  album?: string;
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

  @Column({ nullable: true, unique: true })
  mbId?: string;
}

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  spotifyId?: string;

  @Column({ nullable: true, unique: true })
  mbId?: string;

  @ManyToMany((type) => Track, (track) => track.artists)
  tracks: Relation<Track>[];

  @OneToMany((type) => Album, (track) => track.artist)
  albums: Relation<Album>[];
}
