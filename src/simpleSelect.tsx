import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import VirtualList from "./virtualList";
import NormalList from "./normalList";
import "./style.css";
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

type OptionType = {
  label: string;
  value: string;
  [key: string]: any;
};

type SimpleSelectProps<T extends OptionType = OptionType> = {
  value?: T | undefined | null;
  isClearable?: boolean;
  showSeparator?: boolean;
  className?: string;
  placeholder?: string;
  name?: string;
  inputId?: string;
  options: T[];
  onChange?: (selected: any) => void;
  openMenuOnFocus?: boolean;
  useVirtualList?: boolean;
  isDisabled?: boolean;
  components?: {
    IndicatorDropdown?: JSX.Element | React.ReactNode;
    IndicatorSeparator?: JSX.Element | React.ReactNode;
    IndicatorClearable?: JSX.Element | React.ReactNode;
    Option?: (option: T) => JSX.Element | React.ReactNode;
  };
};

const SimpleSelect = <T extends OptionType>({
  value,
  options,
  components,
  onChange,
  className,
  placeholder,
  name,
  inputId,
  openMenuOnFocus = false,
  isClearable = false,
  isDisabled = false,
  showSeparator = false,
  useVirtualList = false,
}: SimpleSelectProps<T>) => {
  const selIndex = options.findIndex((item) => item.label === value?.label);
  const [state, setState] = useState<{
    isOpen: boolean;
    inputValue: string;
    selectedIndex: number;
    highlightedIndex: number | null;
  }>({
    isOpen: false,
    inputValue: "",
    selectedIndex: selIndex,
    highlightedIndex: null,
  });

  const { isOpen, inputValue, selectedIndex, highlightedIndex } = state;
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const clearableRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLUListElement | FixedSizeList | null>(null);

  useEffect(() => {
    if (value) {
      setState((prev) => {
        return {
          ...prev,
          isOpen: false,
          selectedIndex: selIndex,
          highlightedIndex: selIndex,
        };
      });
    }
  }, [value]);

  useEffect(() => {
    if (options.length > 500 && !useVirtualList) {
      console.warn(
        "There are too many options in the list. Consider setting 'useVirtualList={true}' in <SelectSimple> for improved performance."
      );
    }
    if (highlightedIndex && highlightedIndex > options?.length)
      [setState((prev) => ({ ...prev, highlightedIndex: null }))];
  }, [options]);

  // Toggle the dropdown visibility
  const toggleDropdown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!clearableRef.current?.contains(e.target as Node) && !isDisabled) {
        setState((prev) => ({ ...prev, inputValue: "", isOpen: !prev.isOpen }));
      }
    },
    [isDisabled]
  );

  // Close dropdown if clicked outside
  useEffect(() => {
    if (isOpen) {
      const closeDropdown = (e: MouseEvent) => {
        if (!dropdownRef.current?.contains(e.target as Node)) {
          setState((prev) => ({ ...prev, inputValue: "", isOpen: false }));
        }
      };
      document.addEventListener("mousedown", closeDropdown);
      return () => document.removeEventListener("mousedown", closeDropdown);
    }
  }, [isOpen]);

  // Select the highlighted option
  const handleOptionSelect = useCallback(
    (option: T, index: number) => {
      setState((prev) => ({
        ...prev,
        isOpen: false,
        inputValue: "",
        selectedIndex: index,
        highlightedIndex: index,
      }));
      onChange?.(option);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setState({
      isOpen: false,
      inputValue: "",
      selectedIndex: -1,
      highlightedIndex: null,
    });
    onChange?.(null);
  }, [onChange]);

  const renderOption = useCallback(
    (item: T) => {
      return components?.Option ? components.Option(item) : item?.label;
    },
    [components]
  );

  const filteredOptions = useMemo(() => {
    const lowerInput = inputValue.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(lowerInput)
    );
  }, [inputValue, options]);

  const scrollToItem = (index: number) => {
    const menu = menuRef.current;
    if (!menu) return;
    if (useVirtualList) {
      (menu as FixedSizeList).scrollToItem(index, "auto");
    } else {
      const highlightedOption = (menu as HTMLUListElement).children[index];
      if (highlightedOption instanceof HTMLElement) {
        scrollIntoView(menu as HTMLUListElement, highlightedOption);
      }
    }
  };

  // Handle key press and navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      if (e.target instanceof HTMLInputElement) {
        if (e.altKey && e.key === "ArrowDown") {
          setState((prev) => ({ ...prev, isOpen: true }));
        }
      }
      switch (e.key) {
        case "ArrowDown":
          const index =
            highlightedIndex === null ||
            highlightedIndex === filteredOptions.length - 1
              ? 0
              : highlightedIndex + 1;
          scrollToItem(index);
          setState((prev) => {
            return {
              ...prev,
              highlightedIndex: index,
            };
          });
          break;
        case "ArrowUp":
          const indexUp =
            highlightedIndex === null || highlightedIndex === 0
              ? filteredOptions.length - 1
              : highlightedIndex - 1;

          scrollToItem(indexUp);
          setState((prev) => {
            return {
              ...prev,
              highlightedIndex: indexUp,
            };
          });
          break;
        case "Enter":
          e.preventDefault();
          e.stopPropagation();
          if (highlightedIndex !== null) {
            const selOption = options.findIndex(
              (item) => item.label === filteredOptions[highlightedIndex]?.label
            );
            if (selOption >= 0) {
              handleOptionSelect(options[selOption], selOption);
            }
          }
          break;
        case "Escape":
          setState((prev) => ({ ...prev, isOpen: false }));
          break;
        case "Tab":
          if (highlightedIndex !== null) {
            const selOption = options.findIndex(
              (item) => item.label === filteredOptions[highlightedIndex]?.label
            );
            if (selOption >= 0) {
              handleOptionSelect(options[selOption], selOption);
            }
          } else
            setState((prev) => ({ ...prev, inputValue: "", isOpen: false }));
          break;
      }
    },
    [highlightedIndex, filteredOptions, options, handleOptionSelect, isDisabled]
  );

  return (
    <div
      className={`simple-select${className ? ` ${className}` : ""}${
        isDisabled ? " simple-select_isDisabled" : ""
      }`}
      onKeyDown={handleKeyDown}
      ref={dropdownRef}
    >
      <div className="simple-select-control" onClick={toggleDropdown}>
        {!inputValue && selectedIndex !== -1 && (
          <div className="simple-select-value">
            {renderOption(filteredOptions[selectedIndex])}
          </div>
        )}
        <div className="simple-select-input-control">
          <input
            className="simple-select-input simple-select-placeholder"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            type="text"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-haspopup="true"
            aria-controls="select-custom"
            aria-owns="select-custom"
            role="combobox"
            value={inputValue}
            disabled={isDisabled}
            onFocus={() => {
              if (openMenuOnFocus && !isDisabled) {
                setState((prev) => ({ ...prev, isOpen: true }));
              }
            }}
            onChange={(e) => {
              setState((prev) => ({
                ...prev,
                inputValue: e.target.value,
                highlightedIndex: null,
                isOpen: !prev.isOpen && !isDisabled ? true : prev.isOpen,
              }));
            }}
            {...{
              name: name || undefined,
              id: inputId || undefined,
            }}
            {...(selectedIndex === -1 && {
              placeholder: placeholder ?? "Select",
            })}
          />
        </div>
      </div>
      {isClearable && selectedIndex !== -1 && (
        <div
          onClick={handleClear}
          ref={clearableRef}
          className={`simple-select-indicator-clearable${
            isOpen ? " simple-select-indicator_active" : ""
          }`}
        >
          {components?.IndicatorClearable ? (
            components.IndicatorClearable
          ) : (
            <svg
              height="20"
              width="20"
              viewBox="0 0 20 20"
              aria-hidden="true"
              focusable="false"
              className="simple-select-indicator-size"
            >
              <path
                fill="currentColor"
                d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
              ></path>
            </svg>
          )}
        </div>
      )}
      {(showSeparator || components?.IndicatorSeparator) && (
        <div className="simple-select-indicator-separator">
          {components?.IndicatorSeparator || (
            <div className="simple-select-separator" />
          )}
        </div>
      )}
      <div
        onClick={toggleDropdown}
        className={`simple-select-indicator-dropdown${
          isOpen ? " simple-select-indicator_active" : ""
        }`}
      >
        {components?.IndicatorDropdown ? (
          components.IndicatorDropdown
        ) : (
          <svg
            height="20"
            width="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
            focusable="false"
            className="simple-select-indicator-size"
          >
            <path
              fill="currentColor"
              d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
            ></path>
          </svg>
        )}
      </div>
      {isOpen && (
        <div className="simple-select-dropdown-container">
          {useVirtualList ? (
            <VirtualList
              menuRef={menuRef}
              renderOption={renderOption}
              options={filteredOptions}
              selectedIndex={selectedIndex}
              highlightedIndex={highlightedIndex}
              setHighlightedIndex={(index) =>
                setState((prev) => ({ ...prev, highlightedIndex: index }))
              }
              handleOptionSelect={(opt) => {
                const selOption = options.findIndex(
                  (item) => item.label === opt?.label
                );
                if (selOption >= 0) {
                  handleOptionSelect(options[selOption], selOption);
                }
              }}
            />
          ) : (
            <NormalList
              menuRef={menuRef}
              renderOption={renderOption}
              options={filteredOptions}
              selectedIndex={selectedIndex}
              highlightedIndex={highlightedIndex}
              setHighlightedIndex={(index) =>
                setState((prev) => ({ ...prev, highlightedIndex: index }))
              }
              handleOptionSelect={(opt) => {
                const selOption = options.findIndex(
                  (item) => item.label === opt?.label
                );
                if (selOption >= 0) {
                  handleOptionSelect(options[selOption], selOption);
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleSelect;
