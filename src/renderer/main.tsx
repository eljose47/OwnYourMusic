import * as React from "react";
import { styled } from "styled-components";
import LocalFiles from "./localFiles";
import Menu from "./menu";
import Youtube from "./youtube";
import Spotify from "./spotify";

export const Grid = styled.div`
  /* display: grid;
  grid-template-columns: minmax(0, 180px) auto;
  grid-template-rows: 100%; */

  display: flex;
  height: 100%;
  width: 100%;
`;

const Content = styled.div`
  min-height: 100%;
  max-height: 100%;
  overflow: hidden auto;
`;

export const ContentMap = {
  LocalFiles,
  // Youtube,
  Spotify,
};

export type ContentKeys = keyof typeof ContentMap;

export const contentKeys = Object.keys(ContentMap) as ContentKeys[];

const Main: React.FunctionComponent<MainProps> = (props) => {
  const [activeContent, setActiveContent] =
    React.useState<ContentKeys>("LocalFiles");
  const [menuOpen, setMenuOpen] = React.useState(true);

  return (
    <Grid>
      <Menu
        activeEntry={activeContent}
        entries={contentKeys}
        onEntryChange={(entry) => setActiveContent(entry)}
        open={menuOpen}
        onOpenChange={setMenuOpen}
      />
      <Content>{React.createElement(ContentMap[activeContent])}</Content>
    </Grid>
  );
};

Main.displayName = "Main";

export default Main;

export interface MainProps {}
