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
  const enabledCount = selectedModules.length;
  const totalCount = TENANT_MODULE_META.length;

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-900 dark:text-slate-100">{enabledCount}</span>
          {' of '}
          {totalCount}
          {' modules enabled'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onSelectAll}>
            Enable all
          </Button>
          <Button type="button" variant="secondary" onClick={onClearAll}>
            Disable all
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TENANT_MODULE_META.map((module) => {
          const Icon = module.icon;
          const checked = selectedModules.includes(module.id);

          return (
            <button
              key={module.id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => onToggleModule(module.id)}
              className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                checked
                  ? 'border-white bg-[#122E44] text-white'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
              }`}
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${
                  checked ? 'text-white' : 'text-brand-600 dark:text-brand-400'
                }`}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm font-semibold ${
                    checked ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {module.label}
                </span>
                <span
                  className={`mt-1 block text-xs leading-relaxed ${
                    checked ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {module.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </FormModal>
  );
};
