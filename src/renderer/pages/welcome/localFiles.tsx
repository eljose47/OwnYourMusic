import * as React from "react";

const WelcomeLocalFilesPages: React.FunctionComponent<
  WelcomeLocalFilesPagesProps
> = (props) => {
  const [isScanning, setIsScanning] = React.useState(false);

  return (
    <div>
      <h1>Search a Folder for local files</h1>
      <button
        onClick={async () => {
          setIsScanning(true);
          try {
            await window.electronAPI.doStuff();
          } finally {
            setIsScanning(false);
          }
        }}
      >
        Scan
      </button>
      {isScanning && <div>Scanning...</div>}
    </div>
  );
};

WelcomeLocalFilesPages.displayName = "WelcomeLocalFilesPages";

export default WelcomeLocalFilesPages;

export interface WelcomeLocalFilesPagesProps {}
