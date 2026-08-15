import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type OptionHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { HiChevronDown, HiMagnifyingGlass } from "react-icons/hi2";
import { Input } from "./Input";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "size"
> {
  error?: string;
  icon?: ReactNode;
  wrapperClassName?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  size?: "default" | "sm";
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}

const triggerSizeClasses = {
  default: "px-3 py-2.5",
  sm: "px-2.5 py-1.5 text-sm",
} as const;

const chevronSizeClasses = {
  default: "h-4 w-4",
  sm: "h-3.5 w-3.5",
} as const;

const parseOptions = (children: ReactNode): SelectOption[] => {
  const options: SelectOption[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== "option") {
      return;
    }

    const props = (
      child as ReactElement<OptionHTMLAttributes<HTMLOptionElement>>
    ).props;
    const label =
      typeof props.children === "string" || typeof props.children === "number"
        ? String(props.children)
        : Children.toArray(props.children).join("");

    options.push({
      value: String(props.value ?? ""),
      label,
      disabled: props.disabled,
    });
  });

  return options;
};

const createChangeEvent = (value: string): ChangeEvent<HTMLSelectElement> =>
  ({
    target: { value },
    currentTarget: { value },
  }) as ChangeEvent<HTMLSelectElement>;

export const Select = ({
  error,
  className = "",
  id,
  icon,
  children,
  wrapperClassName = "",
  searchable = false,
  searchPlaceholder = "Search…",
  size = "default",
  value,
  defaultValue,
  disabled,
  required,
  name,
  onChange,
  onBlur: _onBlur,
  "aria-label": ariaLabel,
}: SelectProps) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const options = useMemo(() => parseOptions(children), [children]);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleOptions = useMemo(() => {
    if (!searchable || !normalizedSearch) {
      return options;
    }

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalizedSearch) ||
        option.value.toLowerCase().includes(normalizedSearch),
    );
  }, [normalizedSearch, options, searchable]);
  const selectedValue =
    value !== undefined
      ? String(value)
      : defaultValue !== undefined
        ? String(defaultValue)
        : "";
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );
  const selectedLabel = selectedOption?.label ?? (selectedValue || "Select…");

  const borderClassName = error
    ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-500 dark:border-red-500/60"
    : "border-slate-300 focus-within:border-brand-500";

  const closeMenu = () => {
    setOpen(false);
    setActiveIndex(-1);
    setSearchQuery("");
  };

  const selectOption = (option: SelectOption) => {
    if (option.disabled) {
      return;
    }

    onChange?.(createChangeEvent(option.value));
    closeMenu();
  };

  const enabledOptions = visibleOptions.filter((option) => !option.disabled);

  const moveActiveIndex = (direction: 1 | -1) => {
    if (enabledOptions.length === 0) {
      return;
    }

    const currentIndex =
      activeIndex >= 0
        ? activeIndex
        : enabledOptions.findIndex((option) => option.value === selectedValue);
    const startIndex = currentIndex >= 0 ? currentIndex : 0;
    let nextIndex = startIndex;

    for (let step = 0; step < enabledOptions.length; step += 1) {
      nextIndex =
        (nextIndex + direction + enabledOptions.length) % enabledOptions.length;
      if (!enabledOptions[nextIndex]?.disabled) {
        setActiveIndex(nextIndex);
        break;
      }
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !searchable) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open, searchable]);

  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) {
      return;
    }

    const activeItem = listRef.current.children.item(
      activeIndex,
    ) as HTMLElement | null;
    activeItem?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      moveActiveIndex(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActiveIndex(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveIndex(-1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = enabledOptions[activeIndex];
      if (option) {
        selectOption(option);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    }
  };

  return (
    <div className={`w-full min-w-0 ${wrapperClassName}`} ref={containerRef}>
      {name && <input type="hidden" name={name} value={selectedValue} />}
      <div
        className={`relative w-full rounded-lg border bg-white text-sm shadow-sm transition focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 ${borderClassName} ${className}`}
      >
        <button
          type="button"
          id={fieldId}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-required={required}
          aria-label={ariaLabel}
          aria-invalid={Boolean(error)}
          onClick={() => {
            if (disabled) {
              return;
            }
            setOpen((prev) => !prev);
          }}
          onKeyDown={handleTriggerKeyDown}
          className={`flex w-full items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50 ${triggerSizeClasses[size]}`}
        >
          {icon && (
            <span
              className="pointer-events-none shrink-0 text-slate-400"
              aria-hidden
            >
              {icon}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-slate-900 dark:text-slate-100">
            {selectedLabel}
          </span>
          <HiChevronDown
            className={`${chevronSizeClasses[size]} shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        {open && (
          <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {searchable && (
              <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  placeholder={searchPlaceholder}
                  icon={
                    <HiMagnifyingGlass className="h-4 w-4 text-brand-600" />
                  }
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      moveActiveIndex(1);
                    }
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      moveActiveIndex(-1);
                    }
                    if (event.key === "Enter" && enabledOptions[activeIndex]) {
                      event.preventDefault();
                      selectOption(enabledOptions[activeIndex]);
                    }
                    if (event.key === "Escape") {
                      event.preventDefault();
                      closeMenu();
                    }
                  }}
                />
              </div>
            )}
            <ul
              ref={listRef}
              role="listbox"
              aria-labelledby={fieldId}
              tabIndex={-1}
              onKeyDown={handleListKeyDown}
              className="max-h-60 overflow-auto py-1"
            >
              {visibleOptions.length === 0 ? (
                <li className="px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">
                  No matches found
                </li>
              ) : (
                visibleOptions.map((option) => {
                  const enabledIndex = enabledOptions.findIndex(
                    (item) => item.value === option.value,
                  );
                  const isSelected = option.value === selectedValue;
                  const isActive = enabledIndex === activeIndex;

                  return (
                    <li key={option.value} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={option.disabled}
                        onMouseEnter={() => {
                          if (enabledIndex >= 0) {
                            setActiveIndex(enabledIndex);
                          }
                        }}
                        onClick={() => selectOption(option)}
                        className={`flex w-full items-center px-3 py-2.5 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          isSelected
                            ? "bg-brand-600 text-white"
                            : isActive
                              ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-200"
                              : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        {option.label}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
