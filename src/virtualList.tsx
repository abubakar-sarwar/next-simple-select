import { ReactNode, Ref, useState } from "react";
import { List, ListImperativeAPI, RowComponentProps } from "react-window";

const ITEM_HEIGHT = 40;
const PADDING = 4;
// Must match .simple-select-dropdown max-height in style.scss
const MAX_HEIGHT = 300;

type RowData<T> = {
  options: T[];
  selectedIndex: number;
  highlightedIndex: number | null;
  renderOption: (item: T) => ReactNode;
  setHighlightedIndex: (index: number | null) => void;
  handleOptionSelect: (option: T) => void;
};

// Defined at module level so react-window keeps the same component type
// between renders and never remounts rows
function Row<T>({
  index,
  style,
  ariaAttributes,
  options,
  selectedIndex,
  highlightedIndex,
  renderOption,
  setHighlightedIndex,
  handleOptionSelect,
}: RowComponentProps<RowData<T>>) {
  if (options.length === 0) {
    return (
      <div style={style}>
        <p className="simple-select-no-option">No options</p>
      </div>
    );
  }

  return (
    <div
      style={style}
      aria-posinset={ariaAttributes["aria-posinset"]}
      aria-setsize={ariaAttributes["aria-setsize"]}
      role="option"
      aria-selected={selectedIndex === index}
      className={`simple-select-option${
        highlightedIndex === index ? " simple-select-option__isfocused" : ""
      }${selectedIndex === index ? " simple-select-option__isActive" : ""}`}
      onMouseMove={() => {
        if (highlightedIndex !== index) setHighlightedIndex(index);
      }}
      onClick={() => handleOptionSelect(options[index])}
    >
      {renderOption(options[index])}
    </div>
  );
}

const VirtualList = <T,>({
  menuRef,
  renderOption,
  options,
  selectedIndex,
  highlightedIndex,
  setHighlightedIndex,
  handleOptionSelect,
}: {
  menuRef: Ref<ListImperativeAPI | HTMLUListElement | null>;
  renderOption: (item: T) => ReactNode;
  options: T[];
  selectedIndex: number;
  highlightedIndex: number | null;
  setHighlightedIndex: (index: number | null) => void;
  handleOptionSelect: (option: T) => void;
}) => {
  // Show one row for the "No options" message when empty
  const rowCount = options.length || 1;
  const height = Math.min(rowCount * ITEM_HEIGHT, MAX_HEIGHT - PADDING * 2);

  // Start with the selected option centered. Computed up front because the
  // list isn't measured yet on first render, so scrollToRow can't do it
  const [defaultScrollOffset] = useState(() =>
    selectedIndex > 0
      ? Math.max(
          0,
          Math.min(
            selectedIndex * ITEM_HEIGHT - (height - ITEM_HEIGHT) / 2,
            rowCount * ITEM_HEIGHT - height
          )
        )
      : 0
  );

  // v2 positions rows with transforms, so padding lives on a wrapper
  return (
    <div
      className="simple-select-dropdown simple-select-virtual"
      style={{ padding: `${PADDING}px 0` }}
    >
      <List
        listRef={menuRef as Ref<ListImperativeAPI>}
        rowComponent={Row}
        rowCount={rowCount}
        rowHeight={ITEM_HEIGHT}
        rowProps={{
          options,
          selectedIndex,
          highlightedIndex,
          renderOption,
          setHighlightedIndex,
          handleOptionSelect,
        }}
        defaultScrollOffset={defaultScrollOffset}
        style={{ height }}
      />
    </div>
  );
};

export default VirtualList;
