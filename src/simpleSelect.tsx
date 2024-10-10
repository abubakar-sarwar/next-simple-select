import { useCallback, useEffect, useRef, useState } from "react";
import "./style.css";
import VirtualList from "./virtualList";
import NormalList from "./normalList";

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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const findVal = options.findIndex((item) => item.label === value?.label);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    findVal !== -1 ? findVal : null
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (options.length > 500 && !useVirtualList) {
      console.warn(
        "There are too many options in the list. Consider setting 'useVirtualList={true}' in <SelectSimple> for improved performance."
      );
    }
  }, [options.length, useVirtualList]);

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [isDisabled]);

  // Toggle the dropdown visibility
  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setSelectedIndex(null);
        setIsOpen(false);
        setInputValue("");
        if (onChange) {
          const obj: any = {} as T;

          for (const key in obj) {
            obj[key as any] = undefined;
          }
          onChange(obj);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Handle key press and navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      if (e.target instanceof HTMLInputElement) {
        // Open dropdown with Alt + Down
        if (e.altKey && e.key === "ArrowDown") {
          setIsOpen(true);
        }
      }
      if (!isOpen) return;
      switch (e.key) {
        case "ArrowDown":
          setHighlightedIndex((prev) =>
            prev === null || prev === options.length - 1 ? 0 : prev + 1
          );
          break;
        case "ArrowUp":
          setHighlightedIndex((prev) =>
            prev === null || prev === 0 ? options.length - 1 : prev - 1
          );
          break;
        case "Enter":
          if (highlightedIndex !== null)
            handleOptionSelect(options[highlightedIndex]);
          break;
        case "Escape":
          setIsOpen(false);
          break;
        case "Tab":
          if (highlightedIndex !== null)
            handleOptionSelect(options[highlightedIndex]);
          setIsOpen(false);
          break;
        default:
          break;
      }
    },
    [highlightedIndex, isOpen]
  );

  // Select the highlighted option
  const handleOptionSelect = useCallback(
    (option: T) => {
      setSelectedIndex(options.indexOf(option));
      setIsOpen(false);
      setInputValue("");
      if (onChange) onChange(option);
    },
    [options, onChange]
  );

  const handleClear = useCallback(() => {
    setSelectedIndex(null);
    setIsOpen(false);
    setInputValue("");
    if (onChange) {
      const obj: any = {} as T;

      for (const key in obj) {
        obj[key as any] = undefined;
      }
      onChange(obj);
    }
  }, []);

  const renderOption = useCallback(
    (item: T) => {
      return components?.Option ? components.Option(item) : item.label;
    },
    [components]
  );

  const filterOptions = useCallback(
    (data: T[]) => {
      const valToSearch = inputValue.toLowerCase();
      return data.filter(
        (data) => data?.label.toString().toLowerCase().indexOf(valToSearch) > -1
      );
    },
    [inputValue]
  );

  const filteredOptions = filterOptions(options);

  return (
    <div
      className={`simple-select${className ? ` ${className}` : ""}${
        isDisabled ? " simple-select_isDisabled" : ""
      }`}
      onClick={toggleDropdown}
      onKeyDown={handleKeyDown}
      ref={dropdownRef}
    >
      <div className="simple-select-control">
        {!inputValue && selectedIndex !== null && (
          <div className="simple-select-value">
            {renderOption(options[selectedIndex])}
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
                setIsOpen(true);
              }
            }}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!isOpen && !isDisabled) {
                setIsOpen(true);
              }
            }}
            {...{
              name: name || undefined,
              id: inputId || undefined,
            }}
            {...(selectedIndex === null && {
              placeholder: placeholder ? placeholder : "Select...",
            })}
          />
        </div>
      </div>
      {isClearable && selectedIndex !== null && (
        <div
          onClick={handleClear}
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
              renderOption={renderOption}
              options={filteredOptions}
              selectedIndex={selectedIndex}
              highlightedIndex={highlightedIndex}
              setHighlightedIndex={setHighlightedIndex}
              handleOptionSelect={handleOptionSelect}
            />
          ) : (
            <NormalList
              renderOption={renderOption}
              options={filteredOptions}
              selectedIndex={selectedIndex}
              highlightedIndex={highlightedIndex}
              setHighlightedIndex={setHighlightedIndex}
              handleOptionSelect={handleOptionSelect}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleSelect;
