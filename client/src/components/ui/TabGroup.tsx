import { ReactNode, useState } from 'react';
import { Tabs, type TabItem } from './Tabs';

export interface TabGroupItem<T extends string = string> extends TabItem {
  id: T;
  content: ReactNode;
}

interface TabGroupProps<T extends string> {
  tabs: TabGroupItem<T>[];
  defaultTab?: T;
  activeId?: T;
  onChange?: (id: T) => void;
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
}

export const TabGroup = <T extends string,>({
  tabs,
  defaultTab,
  activeId,
  onChange,
  className = 'space-y-6',
  tabsClassName,
  contentClassName,
}: TabGroupProps<T>) => {
  const [internalActiveId, setInternalActiveId] = useState<T>(
    () => defaultTab ?? tabs[0]?.id
  );

  const isControlled = activeId !== undefined;
  const currentActiveId = isControlled ? activeId : internalActiveId;

  const handleChange = (id: string) => {
    const nextId = id as T;
    if (!isControlled) {
      setInternalActiveId(nextId);
    }
    onChange?.(nextId);
  };

  const activeTab = tabs.find((tab) => tab.id === currentActiveId);

  return (
    <div className={className}>
      <Tabs
        tabs={tabs}
        activeId={currentActiveId}
        onChange={handleChange}
        className={tabsClassName}
      />

      {activeTab && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab.id}`}
          aria-labelledby={`tab-${activeTab.id}`}
          className={contentClassName}
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
};
