import React from "react";
import { FixedSizeList } from "react-window";

const isDocumentElement = (
  el: HTMLElement | typeof window
): el is typeof window => {
  return [document.documentElement, document.body, window].indexOf(el) > -1;
};

const scrollTo = (el: HTMLElement, top: number): void => {
  // with a scroll distance, we perform scroll on the element
  if (isDocumentElement(el)) {
    window.scrollTo(0, top);
    return;
  }

  el.scrollTop = top;
};

const scrollIntoView = (menuEl: HTMLElement, focusedEl: HTMLElement): void => {
  const menuRect = menuEl.getBoundingClientRect();
  const focusedRect = focusedEl.getBoundingClientRect();
  const overScroll = focusedEl.offsetHeight / 3;

  if (focusedRect.bottom + overScroll > menuRect.bottom) {
    scrollTo(
      menuEl,
      Math.min(
        focusedEl.offsetTop +
          focusedEl.clientHeight -
          menuEl.offsetHeight +
          overScroll,
        menuEl.scrollHeight
      )
    );
  } else if (focusedRect.top - overScroll < menuRect.top) {
    scrollTo(menuEl, Math.max(focusedEl.offsetTop - overScroll, 0));
  }
};

const NormalList = <T,>({
  menuRef,
  options,
  highlightedIndex,
  selectedIndex,
  setHighlightedIndex,
  handleOptionSelect,
  renderOption,
}: {
  menuRef: React.Ref<HTMLUListElement | FixedSizeList | null>;
  renderOption: (item: T) => React.ReactNode;
  options: T[];
  selectedIndex: number;
  highlightedIndex: number | null;
  setHighlightedIndex: (index: number | null) => void;
  handleOptionSelect: (option: T, index: number) => void;
}) => {
  return (
    <ul
      className="simple-select-dropdown"
      ref={menuRef as React.Ref<HTMLUListElement>}
    >
      {options.length > 0 ? (
        options.map((item, index) => {
          const isFocused = highlightedIndex === index;
          const isSelected = selectedIndex === index;

          return (
            <li
              key={index}
              className={`simple-select-option${
                isFocused ? " simple-select-option__isfocused" : ""
              }${isSelected ? " simple-select-option__isActive" : ""}`}
              onMouseMove={() => {
                if (highlightedIndex !== index) {
                  setHighlightedIndex(index);
                }
              }}
              onClick={() => handleOptionSelect(item, index)}
              role="option"
              aria-selected={isSelected}
            >
              {renderOption(item)}
            </li>
          );
        })
      ) : (
        <li className="simple-select-no-option">
          <p>No options</p>
        </li>
      )}
    </ul>
  );
};

export default NormalList;
