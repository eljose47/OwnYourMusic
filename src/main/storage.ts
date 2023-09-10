import { app } from "electron";
import path from "path";
import fs from "fs/promises";

type Writefileparams = Parameters<typeof fs.writeFile>;
type Readfileparams = Parameters<typeof fs.readFile>;

export class Storage {
  private userDataDir: string;

  constructor() {
    this.userDataDir = app.getPath("userData");
  }

  write(file: string, data: Writefileparams[1], options?: Writefileparams[2]) {
    const absolutePath = path.resolve(this.userDataDir, file);
    return fs.writeFile(absolutePath, data, options);
  }

  read(file: string, options?: Readfileparams[1]) {
    const absolutePath = path.resolve(this.userDataDir, file);
    return fs.readFile(absolutePath, options);
  }

  resolvePath(relPath: string) {
    return path.resolve(this.userDataDir, relPath);
  }
}
