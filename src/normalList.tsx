import { Dispatch, SetStateAction, useEffect, useRef } from "react";

const NormalList = <T,>({
  options,
  highlightedIndex,
  selectedIndex,
  setHighlightedIndex,
  handleOptionSelect,
  renderOption,
}: {
  renderOption: (
    item: T
  ) =>
    | string
    | number
    | boolean
    | JSX.Element
    | Iterable<React.ReactNode>
    | null
    | undefined;
  options: T[];
  selectedIndex: number | null;
  highlightedIndex: number | null;
  setHighlightedIndex: Dispatch<SetStateAction<number | null>>;
  handleOptionSelect: (option: any) => void;
}) => {
  const dropdownComRef = useRef<HTMLUListElement | null>(null);
  useEffect(() => {
    if (dropdownComRef.current && highlightedIndex !== null) {
      const highlightedOption =
        dropdownComRef.current.children?.[highlightedIndex];
      if (highlightedOption) {
        highlightedOption.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <ul className="simple-select-dropdown" ref={dropdownComRef}>
      {options?.length > 0 ? (
        options.map((item, index) => (
          <li
            key={index}
            className={`simple-select-option${
              highlightedIndex === index
                ? " simple-select-option__isfocused"
                : ""
            }${
              selectedIndex === index ? " simple-select-option__isActive" : ""
            }`}
            onMouseEnter={() => setHighlightedIndex(index)}
            onClick={() => handleOptionSelect(item)}
          >
            {renderOption(item)}
          </li>
        ))
      ) : (
        <li>
          <p className="simple-select-no-option">No Options</p>
        </li>
      )}
    </ul>
  );
};

export default NormalList;
