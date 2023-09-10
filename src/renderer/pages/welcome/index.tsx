import * as React from "react";
import { Link, Route, RouteObject } from "react-router-dom";
import WelcomeServicesPage from "./services";
import WelcomeLocalFilesPages from "./localFiles";

const WelcomePage: React.FunctionComponent<WelcomePageProps> = (props) => {
  return (
    <div>
      <h1>Welcome to OwnYourMusic!</h1>
      <div>
        This app that lets you keep track which music you have locally and which
        music you saved in online music services like spotify.
      </div>
      <h2>How to get started</h2>
      <ol>
        <li>Connect to at least one of your music services</li>
        <li>Search your device for music files</li>
      </ol>
      <div>
        That's pretty much it! Now you can keep track of which tracks you don't
        have saved in your services and add them, or which tracks are still
        missing in your local collection
      </div>

      <br />
      <Link to="services">Let's go</Link>
    </div>
  );
};

WelcomePage.displayName = "WelcomePage";

export default WelcomePage;

export interface WelcomePageProps {}

export const WelcomeRoute: RouteObject = {
  path: "welcome",
  children: [
    {
      path: "",
      element: <WelcomePage />,
    },
    {
      path: "services",
      element: <WelcomeServicesPage />,
    },
    {
      path: "localFiles",
      element: <WelcomeLocalFilesPages />,
    },
  ],
};
