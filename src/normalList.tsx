import React, { memo } from "react";
import type { ListImperativeAPI } from "react-window";

type RowProps<T> = {
  item: T;
  index: number;
  isFocused: boolean;
  isSelected: boolean;
  renderOption: (item: T) => React.ReactNode;
  setHighlightedIndex: (index: number | null) => void;
  handleOptionSelect: (option: T) => void;
};

// Memoized so a highlight change only re-renders the two affected rows
const Row = memo(function Row<T>({
  item,
  index,
  isFocused,
  isSelected,
  renderOption,
  setHighlightedIndex,
  handleOptionSelect,
}: RowProps<T>) {
  return (
    <li
      className={`simple-select-option${
        isFocused ? " simple-select-option__isfocused" : ""
      }${isSelected ? " simple-select-option__isActive" : ""}`}
      onMouseMove={() => {
        if (!isFocused) setHighlightedIndex(index);
      }}
      onClick={() => handleOptionSelect(item)}
      role="option"
      aria-selected={isSelected}
    >
      {renderOption(item)}
    </li>
  );
}) as <T>(props: RowProps<T>) => React.ReactElement;

const NormalList = <T extends { value: string }>({
  menuRef,
  options,
  highlightedIndex,
  selectedIndex,
  setHighlightedIndex,
  handleOptionSelect,
  renderOption,
}: {
  menuRef: React.Ref<HTMLUListElement | ListImperativeAPI | null>;
  renderOption: (item: T) => React.ReactNode;
  options: T[];
  selectedIndex: number;
  highlightedIndex: number | null;
  setHighlightedIndex: (index: number | null) => void;
  handleOptionSelect: (option: T) => void;
}) => {
  return (
    <ul
      className="simple-select-dropdown"
      ref={menuRef as React.Ref<HTMLUListElement>}
    >
      {options.length > 0 ? (
        options.map((item, index) => (
          <Row
            key={item.value}
            item={item}
            index={index}
            isFocused={highlightedIndex === index}
            isSelected={selectedIndex === index}
            renderOption={renderOption}
            setHighlightedIndex={setHighlightedIndex}
            handleOptionSelect={handleOptionSelect}
          />
        ))
      ) : (
        <li className="simple-select-no-option">
          <p>No options</p>
        </li>
      )}
    </ul>
  );
};

export default NormalList;
