// import fs from "fs";
// import readline from "readline";
// import { google } from "googleapis";
// import { BrowserWindow, utilityProcess } from "electron";
// import pkceChallenge from "pkce-challenge";

// const GoogleKeys = {
//   clientId:
//   clientSecret:
// };

// const GoogleOAuth2 = google.auth.OAuth2;

// export class GoogleAuth {
//   client = new GoogleOAuth2(
//     GoogleKeys.clientId,
//     GoogleKeys.clientSecret,
//     "http://localhost:3000"
//   );

//   private getAuthUrl() {
//     return this.client.generateAuthUrl({
//       response_type: "code",
//       scope: "https://www.googleapis.com/auth/youtube.readonly",
//       // code_challenge
//     });
//   }

//   private async exchangeCode(code: string) {
//     //@ts-ignore
//     // const pkce: typeof pkceChallenge = pkceChallenge.default;
//     // const { code_verifier } = await pkce();
//     const { tokens } = await this.client.getToken({ code });

//     const {
//       access_token,
//       expiry_date,
//       refresh_token,
//       id_token,
//       scope,
//       token_type,
//     } = tokens;

//     // const {
//     //   tokens: { access_token, expiry_date, refresh_token },
//     // } = await this.oAuthClient.getToken({ code, codeVerifier: code_verifier });

//     if (
//       !access_token ||
//       !expiry_date ||
//       !refresh_token ||
//       !scope ||
//       !token_type
//     ) {
//       throw new Error("error getting tokens");
//     }

//     this.client.credentials = tokens;
//     return {
//       access_token,
//       expiry_date,
//       refresh_token,
//       id_token,
//       scope,
//       token_type,
//     };
//   }

//   async startFlow() {
//     const authWindow = new BrowserWindow();

//     const code = await new Promise<string>((res, rej) => {
//       authWindow.loadURL(this.getAuthUrl());
//       authWindow.webContents.on("will-redirect", (event, newUrl) => {
//         const { searchParams } = new URL(newUrl);

//         const code = searchParams.get("code");
//         if (code) {
//           authWindow.close();
//           res(code);
//         }

//         const error = searchParams.get("error");
//         if (error) {
//           authWindow.close();
//           rej(error);
//         }
//       });
//     });

//     const { expiry_date, ...tokens } = await this.exchangeCode(code);

//     const session = await Session.create({
//       expires_in: new Date(expiry_date).toISOString(),
//       ...tokens,
//       type: "Google",
//     });

//     return this.client;
//   }

//   async getSession() {
//     let dbSession = await Session.findByPk("Google");

//     if (!dbSession) {
//       const session = await this.startFlow();
//       return this.client;
//     }

//     this.client.credentials = {
//       access_token: dbSession.access_token,
//       id_token: dbSession.id_token,
//       refresh_token: dbSession.refresh_token,
//       scope: dbSession.scope,
//       token_type: dbSession.token_type,
//       expiry_date: new Date(dbSession.expires_in).valueOf(),
//     };

//     return this.client;
//   }

//   // async refreshTokens(refresh_token: string) {
//   //   this.oAuthClient.refreshToken
//   // }
// }
