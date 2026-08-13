import { FormEvent } from 'react';
import { HiArrowsPointingOut, HiSignal } from 'react-icons/hi2';
import { FormActions } from '../../../../components/ui/FormActions';
import { FormField } from '../../../../components/ui/FormField';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import type { SidebarBehavior } from '../../../../types';
import type { SiteSettingsFormValues } from './SiteSettingsForm';

interface SidebarSettingsTabProps {
  values: SiteSettingsFormValues;
  onChange: (field: keyof SiteSettingsFormValues, value: string | number | boolean) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const SidebarSettingsTab = ({
  values,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: SidebarSettingsTabProps) => (
  <form onSubmit={(e) => void onSubmit(e)} className="card-surface space-y-6 p-6">
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Sidebar mode" htmlFor="sidebarBehavior">
        <Select
          id="sidebarBehavior"
          value={values.sidebarBehavior}
          onChange={(e) => onChange('sidebarBehavior', e.target.value as SidebarBehavior)}
          icon={<HiSignal className="h-4 w-4 text-brand-600" />}
          disabled={loading}
        >
          <option value="fixed_collapsed">Always compact sidebar</option>
          <option value="collapsible">Allow expand / collapse</option>
        </Select>
      </FormField>
      {values.sidebarBehavior === 'fixed_collapsed' && (
        <FormField label="Compact sidebar width (80–128 px)" htmlFor="sidebarCollapsedWidthPx">
          <Input
            id="sidebarCollapsedWidthPx"
            type="number"
            min={80}
            max={128}
            value={String(values.sidebarCollapsedWidthPx)}
            onChange={(e) => onChange('sidebarCollapsedWidthPx', Number(e.target.value))}
            icon={<HiArrowsPointingOut className="h-4 w-4 text-brand-600" />}
            disabled={loading}
          />
        </FormField>
      )}
      {values.sidebarBehavior === 'collapsible' && (
        <FormField label="Expanded sidebar width (160–320 px)" htmlFor="sidebarExpandedWidthPx">
          <Input
            id="sidebarExpandedWidthPx"
            type="number"
            min={160}
            max={320}
            value={String(values.sidebarExpandedWidthPx)}
            onChange={(e) => onChange('sidebarExpandedWidthPx', Number(e.target.value))}
            icon={<HiArrowsPointingOut className="h-4 w-4 text-brand-600" />}
            disabled={loading}
          />
        </FormField>
      )}
    </div>

    <p className="text-xs text-slate-500">
      {values.sidebarBehavior === 'fixed_collapsed'
        ? 'Compact width controls how wide the always-compact sidebar appears.'
        : 'Expanded width controls how wide the sidebar opens when users expand it. The collapsed rail uses the platform default compact width.'}
    </p>

    <FormActions
      submitLabel="Save sidebar settings"
      loading={loading}
      loadingText="Saving…"
      submitDisabled={!hasChanges || loading}
    />
  </form>
);
