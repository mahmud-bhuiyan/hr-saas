import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { HiMagnifyingGlass, HiPlus, HiRectangleStack, HiUser } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { useAuth } from '../../contexts/AuthContext';
import {
  ApiError,
  createDocument,
  deleteDocument,
  fetchDocumentDownloadUrl,
  fetchDocuments,
  fetchEmployees,
  fetchExpiringDocuments,
  presignDocumentUpload,
  uploadFileToPresignedUrl,
} from '../../lib/api';
import type { DocumentCategory } from '../../types';
import { areRequiredFieldsFilled } from '../../utils/form';
import { isQueryInitialLoad } from '../../utils/query';
import { hasPermission } from '../../utils/permissions';
import { DocumentsTable } from './components/DocumentsTable';
import {
  UploadDocumentModal,
  type UploadDocumentFormState,
} from './components/UploadDocumentModal';
import { DOCUMENT_CATEGORY_LABELS, inferMimeType, type DocumentsTab } from './utils';

const TENANT_DOCUMENT_ROLES = ['company_admin', 'hr_manager', 'employee'] as const;

const emptyUploadForm = (): UploadDocumentFormState => ({
  category: 'contract',
  employeeId: '',
  expiryDate: '',
  file: null,
});

export const DocumentsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<DocumentsTab>('all');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | ''>('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadDocumentFormState>(emptyUploadForm());
  const [downloadLoadingId, setDownloadLoadingId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const canAccess =
    user && TENANT_DOCUMENT_ROLES.includes(user.role as (typeof TENANT_DOCUMENT_ROLES)[number]);
  const canManage = user && hasPermission(user.role, 'document:manage');
  const canUpload = canManage || (user && hasPermission(user.role, 'document:read:own'));

  const documentsQuery = useQuery({
    queryKey: ['documents', 'all', { categoryFilter, employeeFilter }],
    queryFn: () =>
      fetchDocuments({
        category: categoryFilter || undefined,
        employeeId: employeeFilter || undefined,
      }),
    enabled: Boolean(canAccess && activeTab === 'all'),
  });

  const expiringQuery = useQuery({
    queryKey: ['documents', 'expiring'],
    queryFn: () => fetchExpiringDocuments(30),
    enabled: Boolean(canManage && activeTab === 'expiring'),
  });

  const employeesQuery = useQuery({
    queryKey: ['employees', 'documents'],
    queryFn: () => fetchEmployees({ status: 'active' }),
    enabled: Boolean(canManage),
  });

  const invalidateDocuments = () => {
    void queryClient.invalidateQueries({ queryKey: ['documents'] });
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const mimeType = inferMimeType(file);
      if (!mimeType) {
        throw new ApiError('Unsupported file type', 400);
      }

      const presignInput = {
        fileName: file.name,
        mimeType,
        fileSize: file.size,
        category: uploadForm.category,
        employeeId: uploadForm.employeeId || undefined,
        expiryDate: uploadForm.expiryDate || undefined,
      };

      const presign = await presignDocumentUpload(presignInput);
      await uploadFileToPresignedUrl(presign.uploadUrl, file, mimeType);

      return createDocument({
        ...presignInput,
        fileKey: presign.fileKey,
      });
    },
    onSuccess: () => {
      setUploadOpen(false);
      setUploadForm(emptyUploadForm());
      toast.success('Document uploaded.');
      invalidateDocuments();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to upload document');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast.success('Document deleted.');
      setDeleteLoadingId(null);
      invalidateDocuments();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete document');
      setDeleteLoadingId(null);
    },
  });

  const uploadRequiredFields = useMemo(
    () => ({
      category: uploadForm.category,
      file: uploadForm.file ? 'selected' : '',
    }),
    [uploadForm]
  );

  const uploadSubmitDisabled = !areRequiredFieldsFilled(uploadRequiredFields, ['category', 'file']);

  const handleUploadSubmit = (_event: FormEvent<HTMLFormElement>, file: File) => {
    uploadMutation.mutate(file);
  };

  const handleDownload = async (documentId: string) => {
    setDownloadLoadingId(documentId);
    try {
      const { downloadUrl } = await fetchDocumentDownloadUrl(documentId);
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to download document');
    } finally {
      setDownloadLoadingId(null);
    }
  };

  const activeDocuments = activeTab === 'expiring' ? (expiringQuery.data ?? []) : (documentsQuery.data ?? []);

  const filteredDocuments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return activeDocuments;
    return activeDocuments.filter(
      (doc) =>
        doc.fileName.toLowerCase().includes(term) ||
        doc.employee?.firstName.toLowerCase().includes(term) ||
        doc.employee?.lastName.toLowerCase().includes(term)
    );
  }, [activeDocuments, search]);

  const tabs = useMemo(() => {
    const items: Array<{ id: DocumentsTab; label: string }> = [{ id: 'all', label: 'All documents' }];
    if (canManage) {
      items.push({ id: 'expiring', label: 'Expiring soon' });
    }
    return items;
  }, [canManage]);

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const effectiveTab = tabs.some((t) => t.id === activeTab) ? activeTab : tabs[0].id;

  return (
    <PageContainer>
      <PageHeader
        label="Documents"
        title="Document storage"
        description="Upload and manage HR files with secure cloud storage."
        actionAlign="end"
        action={
          canUpload ? (
            <Button
              icon={<HiPlus className="h-4 w-4 text-white" />}
              onClick={() => setUploadOpen(true)}
            >
              Upload document
            </Button>
          ) : undefined
        }
      />

      {tabs.length > 1 && (
        <Tabs
          tabs={tabs.map((t) => ({ id: t.id, label: t.label }))}
          activeId={effectiveTab}
          onChange={(id) => setActiveTab(id as DocumentsTab)}
          className="mb-6"
        />
      )}

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by file or employee name"
          icon={<HiMagnifyingGlass className="h-4 w-4 text-brand-600" />}
        />

        {canManage && effectiveTab === 'all' && (
          <>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as DocumentCategory | '')}
              icon={<HiRectangleStack className="h-4 w-4 text-brand-600" />}
            >
              <option value="">All categories</option>
              {(Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {DOCUMENT_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </Select>

            <Select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              icon={<HiUser className="h-4 w-4 text-brand-600" />}
            >
              <option value="">All employees</option>
              {(employeesQuery.data ?? []).map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </Select>
          </>
        )}
      </div>

      <DocumentsTable
        documents={filteredDocuments}
        loading={
          effectiveTab === 'expiring'
            ? isQueryInitialLoad(expiringQuery)
            : isQueryInitialLoad(documentsQuery)
        }
        emptyMessage={
          effectiveTab === 'expiring'
            ? 'No documents expiring in the next 30 days.'
            : 'No documents uploaded yet.'
        }
        onDownload={(doc) => void handleDownload(doc.id)}
        onDelete={
          canManage
            ? (doc) => {
                setDeleteLoadingId(doc.id);
                deleteMutation.mutate(doc.id);
              }
            : undefined
        }
        downloadLoadingId={downloadLoadingId}
        deleteLoadingId={deleteMutation.isPending ? deleteLoadingId : null}
      />

      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleUploadSubmit}
        form={uploadForm}
        onFormChange={setUploadForm}
        loading={uploadMutation.isPending}
        submitDisabled={uploadSubmitDisabled}
        employees={employeesQuery.data ?? []}
        showEmployeeSelect={Boolean(canManage)}
      />
    </PageContainer>
  );
};
