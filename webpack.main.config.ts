import type { Configuration } from "webpack";
import { rules } from "./webpack.rules";
import CopyWebpackPlugin from "copy-webpack-plugin";

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main/index.ts",
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "*.{prisma,node}",
          to: ".",
          context: "node_modules/.prisma/client",
        },
      ],
    }),
  ],
};
