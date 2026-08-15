import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { HiChevronDown, HiMagnifyingGlass } from "react-icons/hi2";
import type { CountryDialCode } from "../../utils/phone";
import { sortDialCodesNumerically } from "../../utils/phone";
import { Input } from "./Input";

interface PhoneDialCodeSelectProps {
  value: string;
  options: CountryDialCode[];
  disabled?: boolean;
  onChange: (dialCode: string) => void;
}

const matchesDialCodeSearch = (
  country: CountryDialCode,
  query: string,
): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const dial = country.dialCode.toLowerCase();
  const withPlus = `+${dial}`;

  return (
    country.name.toLowerCase().includes(normalized) ||
    country.code.toLowerCase().includes(normalized) ||
    dial.includes(normalized) ||
    withPlus.includes(normalized)
  );
};

export const PhoneDialCodeSelect = ({
  value,
  options,
  disabled = false,
  onChange,
}: PhoneDialCodeSelectProps) => {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const sortedOptions = useMemo(
    () => sortDialCodesNumerically(options),
    [options],
  );

  const visibleOptions = useMemo(
    () =>
      sortedOptions.filter((country) =>
        matchesDialCodeSearch(country, searchQuery),
      ),
    [searchQuery, sortedOptions],
  );

  const closeMenu = () => {
    setOpen(false);
    setSearchQuery("");
    setActiveIndex(-1);
  };

  const selectDialCode = (dialCode: string) => {
    onChange(dialCode);
    closeMenu();
  };

  const moveActiveIndex = (direction: 1 | -1) => {
    if (visibleOptions.length === 0) {
      return;
    }

    const currentIndex =
      activeIndex >= 0
        ? activeIndex
        : visibleOptions.findIndex((country) => country.dialCode === value);
    const startIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex =
      (startIndex + direction + visibleOptions.length) % visibleOptions.length;
    setActiveIndex(nextIndex);
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
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open]);

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
      const country = visibleOptions[activeIndex];
      if (country) {
        selectDialCode(country.dialCode);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    }
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label="Country code"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className="flex min-w-[4.25rem] items-center gap-0.5 border-0 bg-transparent py-0 pl-0 pr-1 text-sm font-medium text-slate-700 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200"
      >
        <span>+{value}</span>
        <HiChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-2 dark:border-slate-800">
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search country or code"
              icon={<HiMagnifyingGlass className="h-4 w-4 text-brand-600" />}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  moveActiveIndex(1);
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  moveActiveIndex(-1);
                }
                if (event.key === "Enter" && visibleOptions[activeIndex]) {
                  event.preventDefault();
                  selectDialCode(visibleOptions[activeIndex].dialCode);
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeMenu();
                }
              }}
            />
          </div>
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Country codes"
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            className="max-h-60 overflow-auto py-1"
          >
            {visibleOptions.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">
                No matches found
              </li>
            ) : (
              visibleOptions.map((country, index) => {
                const isSelected = country.dialCode === value;
                const isActive = index === activeIndex;

                return (
                  <li
                    key={`${country.code}-${country.dialCode}`}
                    role="presentation"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectDialCode(country.dialCode)}
                      className={`flex w-full items-center px-3 py-2.5 text-left text-sm transition ${
                        isSelected
                          ? "bg-brand-600 text-white"
                          : isActive
                            ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-200"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      +{country.dialCode} — {country.name}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
