import { dialog, ipcMain } from "electron";
import { crawlDirectory } from "./crawler";

ipcMain.on("doStuff", async (event, ...args) => {
  // console.log("on doStuff");
  // await doStuff();
  const dir = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  await crawlDirectory(dir.filePaths[0]);
});
