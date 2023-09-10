import * as React from "react";

const Youtube: React.FunctionComponent<YoutubeProps> = (props) => {
  // const [session, setSession] = React.useState();

  // const getSessionRef = React.useRef<Promise<any>>();
  // React.useEffect(() => {
  //   getSessionRef.current ??= window.electronAPI.getGoogleSession();
  //   getSessionRef.current.then((session) => setSession(session));
  // }, []);
  const [playlist, setPlaylists] = React.useState();

  const getPlaylistsRef = React.useRef<Promise<any>>();
  React.useEffect(() => {
    getPlaylistsRef.current ??= window.electronAPI.getGoogleStuff();
    getPlaylistsRef.current.then((session) => setPlaylists(session));
  }, []);

  React.useEffect(() => console.log("google session", playlist), [playlist]);

  return <div>{JSON.stringify(playlist)}</div>;
};

Youtube.displayName = "Youtube";

export default Youtube;

export interface YoutubeProps {}
