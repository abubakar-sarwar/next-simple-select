"use client";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ListImperativeAPI } from "react-window";
import VirtualList from "./virtualList";
import NormalList from "./normalList";
import "./style.css";

type OptionType = {
  label: string;
  value: string;
  [key: string]: unknown;
};

type SimpleSelectProps<T extends OptionType = OptionType> = {
  value?: T | null;
  defaultValue?: T | null;
  isClearable?: boolean;
  showSeparator?: boolean;
  className?: string;
  placeholder?: string;
  name?: string;
  inputId?: string;
  options: T[];
  onChange?: (selected: T | null) => void;
  openMenuOnFocus?: boolean;
  /** Force virtual list on/off. When omitted, decided by `virtualThreshold` */
  useVirtualList?: boolean;
  /** Use virtual list automatically when options exceed this count. Default 100 */
  virtualThreshold?: number;
  isDisabled?: boolean;
  components?: {
    IndicatorDropdown?: React.ReactNode;
    IndicatorSeparator?: React.ReactNode;
    IndicatorClearable?: React.ReactNode;
    Option?: (option: T) => React.ReactNode;
  };
};

const VIRTUAL_THRESHOLD = 100;

// useLayoutEffect warns during SSR in React 18, so fall back on the server
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Keep `el` inside the visible area of `menu` without touching page scroll
const scrollMenuTo = (menu: HTMLElement, el: HTMLElement, center: boolean) => {
  const top = el.offsetTop;
  const bottom = top + el.offsetHeight;
  if (center)
    menu.scrollTop = top - (menu.clientHeight - el.offsetHeight) / 2;
  else if (top < menu.scrollTop) menu.scrollTop = top;
  else if (bottom > menu.scrollTop + menu.clientHeight)
    menu.scrollTop = bottom - menu.clientHeight;
};

const ClearIcon = (
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
    />
  </svg>
);

const DropdownIcon = (
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
    />
  </svg>
);

const SimpleSelect = <T extends OptionType>({
  value,
  defaultValue = null,
  options,
  components,
  onChange,
  className,
  placeholder = "Select",
  name,
  inputId,
  openMenuOnFocus = false,
  isClearable = false,
  isDisabled = false,
  showSeparator = false,
  useVirtualList: useVirtualListProp,
  virtualThreshold = VIRTUAL_THRESHOLD,
}: SimpleSelectProps<T>) => {
  // Based on total options, not filtered ones, so the list type doesn't
  // flip (and remount) while the user types
  const useVirtualList =
    useVirtualListProp ?? options.length > virtualThreshold;

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  // Index into filteredOptions
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [internalValue, setInternalValue] = useState<T | null>(defaultValue);

  // Controlled when `value` is passed (including null), uncontrolled otherwise
  const selected = value !== undefined ? value : internalValue;

  const listId = useId();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLUListElement | ListImperativeAPI | null>(null);

  // Latest onChange without making callbacks (and list rows) depend on it
  const onChangeRef = useRef(onChange);
  useIsomorphicLayoutEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Filter in the background so typing stays responsive on huge lists
  const deferredInput = useDeferredValue(inputValue);
  const isSearching = deferredInput !== "";

  // Lowercased labels, built only once the user starts searching
  const lowerLabels = useMemo(
    () => (isSearching ? options.map((opt) => opt.label.toLowerCase()) : null),
    [options, isSearching]
  );

  const filteredOptions = useMemo(() => {
    if (!lowerLabels) return options;
    const q = deferredInput.toLowerCase();
    return options.filter((_, i) => lowerLabels[i].includes(q));
  }, [deferredInput, options, lowerLabels]);

  const selectedIndex = useMemo(
    () =>
      selected
        ? filteredOptions.findIndex((opt) => opt.value === selected.value)
        : -1,
    [filteredOptions, selected]
  );

  const open = useCallback(() => {
    setIsOpen(true);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : null);
  }, [selectedIndex]);

  const close = useCallback(() => {
    setIsOpen(false);
    setInputValue("");
    setHighlightedIndex(null);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, close]);

  // Center the highlighted option when the menu opens, then scroll only
  // as much as needed while navigating with the keyboard
  // Layout effects run before paint, so the menu never shows unscrolled
  const justOpenedRef = useRef(false);
  // Set by keyboard/typing only, so mouse hover never scrolls the menu
  const scrollOnHighlightRef = useRef(false);
  useIsomorphicLayoutEffect(() => {
    justOpenedRef.current = isOpen;
  }, [isOpen]);

  useIsomorphicLayoutEffect(() => {
    const center = justOpenedRef.current;
    const shouldScroll = center || scrollOnHighlightRef.current;
    justOpenedRef.current = false;
    scrollOnHighlightRef.current = false;
    const menu = menuRef.current;
    if (!shouldScroll || !isOpen || highlightedIndex === null || !menu) return;
    if (useVirtualList) {
      // Initial centering is handled by VirtualList's defaultScrollOffset
      if (center) return;
      (menu as ListImperativeAPI).scrollToRow({
        index: highlightedIndex,
        align: "auto",
      });
    } else {
      const el = (menu as HTMLUListElement).children[highlightedIndex];
      if (el instanceof HTMLElement) scrollMenuTo(menu as HTMLElement, el, center);
    }
  }, [highlightedIndex, isOpen, useVirtualList]);

  const select = useCallback(
    (option: T | null | undefined) => {
      if (!option) return;
      setInternalValue(option);
      close();
      onChangeRef.current?.(option);
    },
    [close]
  );

  const handleClear = useCallback(() => {
    setInternalValue(null);
    close();
    onChangeRef.current?.(null);
  }, [close]);

  // Runs on mousedown (not click) so the menu starts rendering ~100ms earlier
  const toggleDropdown = useCallback((e: React.MouseEvent) => {
    if (isDisabled || e.button !== 0) return;
    if (isOpen) close();
    else open();
  }, [isDisabled, isOpen, open, close]);

  const OptionComponent = components?.Option;
  const renderOption = useCallback(
    (item: T) => (OptionComponent ? OptionComponent(item) : item?.label),
    [OptionComponent]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      const count = filteredOptions.length;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp": {
          e.preventDefault();
          if (!isOpen) {
            open();
            return;
          }
          if (!count) return;
          const down = e.key === "ArrowDown";
          scrollOnHighlightRef.current = true;
          setHighlightedIndex((i) =>
            i === null
              ? down
                ? 0
                : count - 1
              : (i + (down ? 1 : -1) + count) % count
          );
          return;
        }
        case "Enter":
          if (!isOpen) return;
          e.preventDefault();
          if (highlightedIndex !== null) select(filteredOptions[highlightedIndex]);
          return;
        case "Tab":
          if (!isOpen) return;
          if (highlightedIndex !== null) select(filteredOptions[highlightedIndex]);
          else close();
          return;
        case "Escape":
          if (isOpen) close();
          return;
      }
    },
    [isDisabled, isOpen, highlightedIndex, filteredOptions, open, close, select]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      scrollOnHighlightRef.current = true;
      setHighlightedIndex(e.target.value ? 0 : null);
      if (!isDisabled) setIsOpen(true);
    },
    [isDisabled]
  );

  const handleFocus = useCallback(() => {
    if (openMenuOnFocus && !isDisabled && !isOpen) open();
  }, [openMenuOnFocus, isDisabled, isOpen, open]);

  const hoverHighlight = useCallback((index: number | null) => {
    scrollOnHighlightRef.current = false;
    setHighlightedIndex(index);
  }, []);

  const listProps = {
    menuRef,
    renderOption,
    options: filteredOptions,
    selectedIndex,
    highlightedIndex,
    setHighlightedIndex: hoverHighlight,
    handleOptionSelect: select,
  };

  return (
    <div
      className={`simple-select${className ? ` ${className}` : ""}${
        isDisabled ? " simple-select_isDisabled" : ""
      }`}
      onKeyDown={handleKeyDown}
      ref={dropdownRef}
    >
      <div className="simple-select-control" onMouseDown={toggleDropdown}>
        {!inputValue && selected && (
          <div className="simple-select-value">{renderOption(selected)}</div>
        )}
        <div className="simple-select-input-control">
          <input
            className="simple-select-input simple-select-placeholder"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={listId}
            value={inputValue}
            disabled={isDisabled}
            name={name}
            id={inputId}
            placeholder={selected ? undefined : placeholder}
            onFocus={handleFocus}
            onChange={handleInputChange}
          />
        </div>
      </div>
      {isClearable && selected && (
        <div
          role="button"
          aria-label="Clear selection"
          onClick={handleClear}
          className={`simple-select-indicator-clearable${
            isOpen ? " simple-select-indicator_active" : ""
          }`}
        >
          {components?.IndicatorClearable ?? ClearIcon}
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
        onMouseDown={toggleDropdown}
        className={`simple-select-indicator-dropdown${
          isOpen ? " simple-select-indicator_active" : ""
        }`}
      >
        {components?.IndicatorDropdown ?? DropdownIcon}
      </div>
      {isOpen && (
        <div
          id={listId}
          role="listbox"
          className="simple-select-dropdown-container"
        >
          {useVirtualList ? (
            <VirtualList {...listProps} />
          ) : (
            <NormalList {...listProps} />
          )}
        </div>
      )}
    </div>
  );
};

// Skip re-renders when props are unchanged. Keep `options` and `components`
// stable (module level or useMemo) to benefit
export default memo(SimpleSelect) as typeof SimpleSelect;
