import { forwardRef, ReactNode, useCallback, useEffect, useRef } from "react";
import { FixedSizeList, FixedSizeList as List } from "react-window";

const ITEM_HEIGHT = 40;

const VirtualList = <T,>({
  menuRef,
  renderOption,
  options,
  selectedIndex,
  highlightedIndex,
  setHighlightedIndex,
  handleOptionSelect,
}: {
  menuRef: React.Ref<HTMLUListElement | FixedSizeList | null>;
  renderOption: (item: T) => ReactNode;
  options: T[];
  selectedIndex: number;
  highlightedIndex: number | null;
  setHighlightedIndex: (index: number | null) => void;
  handleOptionSelect: (option: any) => void;
}) => {
  const renderOptionList = ({
    index,
    style,
  }: {
    index: number;
    style: any;
  }) => {
    if (options.length === 0) {
      return (
        <div style={{ ...style, top: `${parseFloat(style.top) + 4}px` }}>
          <p className="simple-select-no-option">No options</p>
        </div>
      );
    }

    return (
      <div
        style={{ ...style, top: `${parseFloat(style.top) + 4}px` }}
        className={`simple-select-option${
          highlightedIndex === index ? " simple-select-option__isfocused" : ""
        }${selectedIndex === index ? " simple-select-option__isActive" : ""}`}
        onMouseMove={() => {
          if (highlightedIndex !== index) {
            setHighlightedIndex(index);
          }
        }}
        onClick={() => handleOptionSelect(options[index])}
      >
        {renderOption(options[index])}
      </div>
    );
  };

  const calculatedHeight =
    Math.min(options.length === 0 ? 1 : options.length, 7) * ITEM_HEIGHT + 8;

  const innerElementType = forwardRef(({ style, ...rest }: any, ref) => {
    const adding = options.length === 0 ? 0 : 8;
    return (
      <div
        ref={ref}
        style={{
          ...style,
          height: `${parseFloat(style.height) + 8}px`,
        }}
        {...rest}
      />
    );
  });

  return (
    <List
      ref={menuRef as React.Ref<FixedSizeList<any>>}
      className="simple-select-dropdown simple-select-virtual"
      height={options.length === 0 ? 48 : calculatedHeight}
      itemSize={ITEM_HEIGHT}
      itemCount={options.length === 0 ? 1 : options.length} // Set item count to 1 when there are no options
      width="100%"
      innerElementType={innerElementType}
    >
      {renderOptionList}
    </List>
  );
};

export default VirtualList;
