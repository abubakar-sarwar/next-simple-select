import { ReactNode, useCallback, useEffect, useRef } from "react";
import { FixedSizeList as List } from "react-window";

const ITEM_HEIGHT = 40;

const VirtualList = <T,>({
  renderOption,
  options,
  selectedIndex,
  highlightedIndex,
  setHighlightedIndex,
  handleOptionSelect,
}: {
  renderOption: (item: T) => ReactNode;
  options: T[];
  selectedIndex: number;
  highlightedIndex: number | null;
  setHighlightedIndex: (index: number | null) => void;
  handleOptionSelect: (option: any) => void;
}) => {
  const renderOptionList = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      if (options.length === 0) {
        return (
          <div style={{ ...style }}>
            <p className="simple-select-no-option">No options</p>
          </div>
        );
      }

      return (
        <div
          style={style}
          className={`simple-select-option${
            highlightedIndex === index ? " simple-select-option__isfocused" : ""
          }${selectedIndex === index ? " simple-select-option__isActive" : ""}`}
          onMouseEnter={() => {
            if(highlightedIndex !== index) {
              setHighlightedIndex(index)
            }
          }}
          onClick={() => handleOptionSelect(options[index])}
        >
          {renderOption(options[index])}
        </div>
      );
    },
    [highlightedIndex, selectedIndex, options, handleOptionSelect, renderOption]
  );

  const calculatedHeight =
    Math.min(options.length === 0 ? 1 : options.length, 7) * ITEM_HEIGHT + 2;

  const listRef = useRef<List>(null); // Ref for the list
  useEffect(() => {
    if (listRef.current && highlightedIndex !== null) {
      listRef.current.scrollToItem(highlightedIndex, "auto"); // Scroll the highlighted item into view
    }
  }, [highlightedIndex]);

  return (
    <List
      className="simple-select-dropdown simple-select-virtual"
      ref={listRef}
      height={options.length === 0 ? 42 : calculatedHeight}
      itemSize={ITEM_HEIGHT}
      itemCount={options.length === 0 ? 1 : options.length} // Set item count to 1 when there are no options
      width="100%"
    >
      {renderOptionList}
    </List>
  );
};

export default VirtualList;
