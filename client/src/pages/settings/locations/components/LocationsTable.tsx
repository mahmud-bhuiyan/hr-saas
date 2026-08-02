import { HiArchiveBox, HiPencilSquare } from 'react-icons/hi2';
import { Button } from '../../../../components/ui/Button';
import type { TableColumn } from '../../../../components/ui/Table';
import { Table } from '../../../../components/ui/Table';
import type { WorkLocation } from '../../../../types';

interface LocationsTableProps {
  locations: WorkLocation[];
  loading: boolean;
  onEdit: (location: WorkLocation) => void;
  onArchive: (location: WorkLocation) => void;
  onRestore: (location: WorkLocation) => void;
  archiveLoadingId: string | null;
  restoreLoadingId: string | null;
}

export const LocationsTable = ({
  locations,
  loading,
  onEdit,
  onArchive,
  onRestore,
  archiveLoadingId,
  restoreLoadingId,
}: LocationsTableProps) => {
  const columns: TableColumn<WorkLocation>[] = [
    {
      key: 'name',
      header: 'Name',
      align: 'left',
      render: (location) => (
        <span
          className={
            location.isArchived ? 'text-slate-400 line-through' : 'font-medium text-slate-900 dark:text-slate-100'
          }
        >
          {location.name}
        </span>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      align: 'left',
      render: (location) => location.address ?? '—',
    },
    {
      key: 'timezone',
      header: 'Timezone',
      render: (location) => location.timezone ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (location) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            location.isArchived
              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
          }`}
        >
          {location.isArchived ? 'Archived' : 'Active'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (location) => (
        <div className="flex items-center justify-center gap-2">
          {!location.isArchived ? (
            <>
              <Button
                type="button"
                variant="ghost"
                icon={<HiPencilSquare className="h-4 w-4 text-amber-500" />}
                onClick={() => onEdit(location)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                loading={archiveLoadingId === location.id}
                loadingText="Archiving…"
                icon={<HiArchiveBox className="h-4 w-4 text-slate-500" />}
                onClick={() => onArchive(location)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              loading={restoreLoadingId === location.id}
              loadingText="Restoring…"
              onClick={() => onRestore(location)}
            >
              Restore
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table<WorkLocation>
      columns={columns}
      data={locations}
      getRowKey={(location) => location.id}
      loading={loading}
      emptyMessage="No work locations yet. Create one for shift scheduling."
    />
  );
};
