import * as React from "react";
import { ContentKeys } from "./main";
import { styled } from "styled-components";

const Container = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  max-width: 180px;
  transition: max-width ease-in-out 200ms;
`;

const Toggle = styled.div`
  position: fixed;
  top: 0;
  height: 20px;
  width: 20px;
  border-radius: 10px;
  background: white;
  text-align: center;
`;

const Menu: React.FunctionComponent<MenuProps> = (props) => {
  return (
    <Container style={{ maxWidth: !props.open ? 0 : undefined }}>
      <div>
        <Toggle
          style={props.open ? { right: 0 } : { left: 0 }}
          onClick={() => props.onOpenChange(!props.open)}
        >
          X
        </Toggle>
      </div>
      {props.entries.map((entry) => (
        <div>
          <button
            onClick={() => {
              if (props.activeEntry === entry) {
                return;
              }
              props.onEntryChange(entry);
            }}
          >
            {entry}
          </button>
        </div>
      ))}
    </Container>
  );
};

Menu.displayName = "Menu";

export default Menu;

export interface MenuProps {
  entries: ContentKeys[];
  onEntryChange(newEntry: ContentKeys): any;
  activeEntry: ContentKeys;

  open: boolean;
  onOpenChange(value: boolean): any;
}
