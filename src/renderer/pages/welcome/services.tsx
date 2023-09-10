import * as React from "react";
import { Link } from "react-router-dom";

const WelcomeServicesPage: React.FunctionComponent<WelcomeServicesPageProps> = (
  props
) => {
  const [connected, setConnected] = React.useState<string[]>([]);

  return (
    <div>
      <h1>Connect to your services</h1>
      <ul>
        <li>
          <a
            onClick={async () => {
              if (connected.includes("spotify")) {
                return;
              }
              await window.electronAPI.authenticate.spotify();
              setConnected((prev) => [...prev, "spotify"]);
            }}
          >
            Spotify
            {connected.includes("spotify") && " ✓"}
          </a>
        </li>
      </ul>
      <div>
        <Link to={connected.length > 0 && "/welcome/localFiles"}>Continue</Link>
      </div>
    </div>
  );
};

WelcomeServicesPage.displayName = "WelcomeServicesPage";

export default WelcomeServicesPage;

export interface WelcomeServicesPageProps {}
