import { useQuery } from '@tanstack/react-query';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowRightOnRectangle,
  HiBriefcase,
  HiBuildingOffice2,
  HiCalendarDays,
  HiChartBar,
  HiClock,
  HiCog6Tooth,
  HiCurrencyDollar,
  HiDocumentText,
  HiHome,
  HiMagnifyingGlass,
  HiTableCells,
  HiUser,
  HiUserGroup,
} from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { fetchEmployees } from '../lib/api';
import type { Employee } from '../types';
import { employeeName, employeeMatchesSearch } from '../pages/employees/utils';
import {
  filterGlobalSearchActions,
  type GlobalSearchActionDef,
} from '../utils/global-search-actions';
import { hasPermission } from '../utils/permissions';
import { Spinner } from './ui/Spinner';

type SearchResult =
  | { type: 'action'; action: GlobalSearchActionDef }
  | { type: 'employee'; employee: Employee };

const ACTION_ICONS: Record<string, ReactNode> = {
  dashboard: <HiHome className="h-4 w-4 text-brand-600" aria-hidden />,
  profile: <HiUser className="h-4 w-4 text-brand-600" aria-hidden />,
  leave: <HiCalendarDays className="h-4 w-4 text-amber-500" aria-hidden />,
  attendance: <HiClock className="h-4 w-4 text-emerald-500" aria-hidden />,
  timesheets: <HiTableCells className="h-4 w-4 text-violet-500" aria-hidden />,
  expenses: <HiCurrencyDollar className="h-4 w-4 text-green-500" aria-hidden />,
  employees: <HiUserGroup className="h-4 w-4 text-brand-600" aria-hidden />,
  documents: <HiDocumentText className="h-4 w-4 text-sky-500" aria-hidden />,
  rotas: <HiBriefcase className="h-4 w-4 text-orange-500" aria-hidden />,
  payroll: <HiCurrencyDollar className="h-4 w-4 text-green-600" aria-hidden />,
  reports: <HiChartBar className="h-4 w-4 text-indigo-500" aria-hidden />,
  settings: <HiCog6Tooth className="h-4 w-4 text-slate-500" aria-hidden />,
  registrations: <HiBuildingOffice2 className="h-4 w-4 text-brand-600" aria-hidden />,
  'site-settings': <HiCog6Tooth className="h-4 w-4 text-brand-600" aria-hidden />,
};

const employeeInitials = (employee: Employee): string => {
  return `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase();
};

const searchResultButtonClass = (isActive: boolean): string =>
  isActive
    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800';

const searchResultSubtitleClass = (isActive: boolean): string =>
  isActive ? 'text-brand-600/80 dark:text-brand-300/90' : 'text-slate-500 dark:text-slate-400';

export const GlobalSearch = () => {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebouncedValue(query, 280);
  const isQuerySettled = query.trim() === debouncedQuery.trim();

  const canSearchEmployees =
    !!user &&
    (hasPermission(user.role, 'employee:read') || hasPermission(user.role, 'employee:read:team'));

  const actions = useMemo(
    () => (user ? filterGlobalSearchActions(query, user.role) : []),
    [query, user]
  );

  const employeesQuery = useQuery({
    queryKey: ['global-search', 'employees', debouncedQuery],
    queryFn: () => fetchEmployees({ search: debouncedQuery }),
    enabled: canSearchEmployees && debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  });

  const employees = useMemo(() => {
    if (!isQuerySettled || !employeesQuery.data) {
      return [];
    }

    const search = debouncedQuery.trim();
    return employeesQuery.data
      .filter((employee) => employeeMatchesSearch(employee, search))
      .slice(0, 8);
  }, [debouncedQuery, employeesQuery.data, isQuerySettled]);

  const isEmployeesLoading =
    canSearchEmployees && debouncedQuery.trim().length >= 2 && (!isQuerySettled || employeesQuery.isFetching);

  const results = useMemo((): SearchResult[] => {
    const items: SearchResult[] = actions.map((action) => ({ type: 'action', action }));

    if (canSearchEmployees && debouncedQuery.trim().length >= 2) {
      employees.forEach((employee) => {
        items.push({ type: 'employee', employee });
      });
    }

    return items;
  }, [actions, canSearchEmployees, debouncedQuery, employees]);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const selectResult = useCallback(
    (result: SearchResult) => {
      if (result.type === 'action') {
        navigate(result.action.route);
      } else {
        navigate(`/dashboard/employees/${result.employee.id}`);
      }

      setQuery('');
      closeSearch();
      inputRef.current?.blur();
    },
    [closeSearch, navigate]
  );

  useEffect(() => {
    const handleGlobalShortcut = (event: globalThis.KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcut);
    return () => window.removeEventListener('keydown', handleGlobalShortcut);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeSearch]);

  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [results.length, query, debouncedQuery]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      closeSearch();
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || results.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      selectResult(results[activeIndex]!);
    }
  };

  if (!user) {
    return null;
  }

  const showEmployeeSection =
    canSearchEmployees && debouncedQuery.trim().length >= 2;
  const showEmptyState =
    isOpen &&
    query.trim().length > 0 &&
    actions.length === 0 &&
    (!showEmployeeSection || (!isEmployeesLoading && employees.length === 0));

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          aria-hidden
        >
          <HiMagnifyingGlass className="h-4 w-4" />
        </span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label="Search employees or actions"
          placeholder="Search by name, email, or action (Ex: Apply Leave)"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="block w-full rounded-full border border-slate-300 bg-slate-100 py-2 pl-9 pr-16 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-500 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-900"
        />
        <kbd
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 sm:inline-block"
          aria-hidden
        >
          Alt + K
        </kbd>
      </div>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(24rem,70vh)] overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {actions.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Actions
              </p>
              {actions.map((action, index) => {
                const resultIndex = index;
                const isActive = activeIndex === resultIndex;

                return (
                  <button
                    key={action.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(resultIndex)}
                    onClick={() => selectResult({ type: 'action', action })}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${searchResultButtonClass(isActive)}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      {ACTION_ICONS[action.id] ?? (
                        <HiArrowRightOnRectangle className="h-4 w-4 text-brand-600" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{action.label}</span>
                      {action.subtitle && (
                        <span className={`block truncate text-xs ${searchResultSubtitleClass(isActive)}`}>
                          {action.subtitle}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {showEmployeeSection && (
            <div className={actions.length > 0 ? 'mt-1 border-t border-slate-100 pt-1 dark:border-slate-800' : ''}>
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Employees
              </p>
              {isEmployeesLoading && (
                <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                  <Spinner className="h-4 w-4" />
                  Searching employees…
                </div>
              )}
              {!isEmployeesLoading &&
                employees.map((employee, index) => {
                  const resultIndex = actions.length + index;
                  const isActive = activeIndex === resultIndex;

                  return (
                    <button
                      key={employee.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIndex(resultIndex)}
                      onClick={() => selectResult({ type: 'employee', employee })}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${searchResultButtonClass(isActive)}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                        {employeeInitials(employee)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{employeeName(employee)}</span>
                        <span className={`block truncate text-xs ${searchResultSubtitleClass(isActive)}`}>
                          {employee.jobTitle || employee.email || employee.department || 'Employee'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              {!isEmployeesLoading && employees.length === 0 && (
                <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                  No employees found
                </p>
              )}
            </div>
          )}

          {showEmptyState && (
            <p className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              No employees or actions found
            </p>
          )}

          {!query.trim() && actions.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Type to search employees or actions
            </p>
          )}
        </div>
      )}
    </div>
  );
};
