import * as React from "react";
import { Link } from "react-router-dom";

const WelcomeServicesPage: React.FunctionComponent<WelcomeServicesPageProps> = (
  props
) => {
  return (
    <ul>
      <li>{/* <a onClick={() => }>Spotify</a> */}</li>
    </ul>
  );
};

WelcomeServicesPage.displayName = "WelcomeServicesPage";

export default WelcomeServicesPage;

export interface WelcomeServicesPageProps {}
