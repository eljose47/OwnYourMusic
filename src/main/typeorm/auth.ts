import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Session {
  @PrimaryColumn()
  type: "Spotify" | "Youtube";

  @Column()
  access_token: string;

  @Column("date")
  expires_in: Date;

  @Column()
  refresh_token: string;

  @Column({ nullable: true })
  scope: string;

  @Column()
  token_type: string;
}
