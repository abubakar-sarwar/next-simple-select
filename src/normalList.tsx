import React, { useEffect, useRef } from "react";

const NormalList = <T,>({
  options,
  highlightedIndex,
  selectedIndex,
  setHighlightedIndex,
  handleOptionSelect,
  renderOption,
}: {
  renderOption: (item: T) => React.ReactNode;
  options: T[];
  selectedIndex: number | null;
  highlightedIndex: number | null;
  setHighlightedIndex: (index: number | null) => void;
  handleOptionSelect: (option: T, index: number) => void;
}) => {
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (dropdownRef.current && highlightedIndex !== null) {
      const highlightedOption = dropdownRef.current.children[highlightedIndex];
      if (highlightedOption instanceof HTMLElement) {
        highlightedOption.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  return (
    <ul className="simple-select-dropdown" ref={dropdownRef}>
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
              onMouseEnter={() => setHighlightedIndex(index)}
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
          <p>No Options</p>
        </li>
      )}
    </ul>
  );
};

export default NormalList;
