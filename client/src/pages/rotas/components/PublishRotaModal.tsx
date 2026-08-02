import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { formatWeekRange } from '../utils';

interface PublishRotaModalProps {
  open: boolean;
  weekOf: string;
  draftCount: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PublishRotaModal = ({
  open,
  weekOf,
  draftCount,
  loading,
  onClose,
  onConfirm,
}: PublishRotaModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Publish weekly rota"
    description={`Publish ${draftCount} draft shift${draftCount === 1 ? '' : 's'} for ${formatWeekRange(weekOf)}? Assigned shifts become visible to staff; unassigned shifts become open for claiming.`}
    footer={
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="button" loading={loading} loadingText="Publishing" onClick={onConfirm}>
          Publish rota
        </Button>
      </div>
    }
  >
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-200">
      Shifts overlapping approved leave will block publishing. Fix conflicts before continuing.
    </div>
  </Modal>
);
