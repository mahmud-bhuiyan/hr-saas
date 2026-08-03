import { FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { FormModal } from '../../../components/ui/FormModal';
import { TENANT_MODULE_META, type TenantModuleId } from '../../../types/modules';

interface ManageCompanyModulesModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  companyName: string;
  selectedModules: TenantModuleId[];
  onToggleModule: (moduleId: TenantModuleId) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  loading: boolean;
  submitDisabled: boolean;
}

export const ManageCompanyModulesModal = ({
  open,
  onClose,
  onSubmit,
  companyName,
  selectedModules,
  onToggleModule,
  onSelectAll,
  onClearAll,
  loading,
  submitDisabled,
}: ManageCompanyModulesModalProps) => {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Manage modules"
      description={`Choose which HR modules ${companyName} can access.`}
      submitLabel="Save modules"
      loading={loading}
      submitDisabled={submitDisabled}
      size="lg"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {TENANT_MODULE_META.map((module) => {
          const Icon = module.icon;
          const checked = selectedModules.includes(module.id);

          return (
            <label
              key={module.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                checked
                  ? 'border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                checked={checked}
                onChange={() => onToggleModule(module.id)}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <Icon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                  {module.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  {module.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onSelectAll}>
          Enable all
        </Button>
        <Button type="button" variant="secondary" onClick={onClearAll}>
          Disable all
        </Button>
      </div>
    </FormModal>
  );
};
