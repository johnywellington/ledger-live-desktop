// @flow

import React, { useState } from "react";
import styled from "styled-components";

import Box from "~/renderer/components/Box";
import SearchIcon from "~/renderer/icons/Search";
import type { ThemedComponent } from "~/renderer/styles/StyleProvider";

type Props = {
  onTextChange: (evt: SyntheticInputEvent<HTMLInputElement>) => void,
  search?: string,
};

const SearchInput: ThemedComponent<{}> = styled.input`
  border: none;
  background: transparent;
  outline: none;
  flex-grow: 1;
  font-family: "Inter";
  cursor: text;
  color: ${p => p.theme.colors.palette.text.shade100};
  &::placeholder {
    color: #999999;
    font-weight: 500;
  }
`;

const SearchIconContainer: ThemedComponent<{ focused?: boolean }> = styled(Box).attrs(p => ({
  style: {
    color: p.focused ? p.theme.colors.palette.text.shade100 : p.theme.colors.palette.text.shade40,
  },
}))`
  justify-content: center;
`;

const SearchBox = ({ onTextChange, search }: Props) => {
  const [focused, setFocused] = useState(false);

  return (
    <>
      <SearchIconContainer pr={3} focused={focused || !!search}>
        <SearchIcon size={16} />
      </SearchIconContainer>
      <SearchInput
        autoFocus
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search"
        onChange={onTextChange}
        value={search}
      />
    </>
  );
};

export default React.memo<Props>(SearchBox);