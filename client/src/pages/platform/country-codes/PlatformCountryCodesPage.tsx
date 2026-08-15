import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { HiPlus } from "react-icons/hi2";
import { toast } from "react-toastify";
import { Button } from "../../../components/ui/Button";
import { PageContainer } from "../../../components/ui/PageContainer";
import { PageHeader } from "../../../components/layout/PageHeader";
import { TabGroup } from "../../../components/ui/TabGroup";
import { useTabUrlState } from "../../../hooks/useTabUrlState";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ApiError,
  createCountryDialCode,
  fetchManagedCountryDialCodes,
  updateCountryDialCode,
} from "../../../lib/api";
import type {
  CountryDialCodeRecord,
  PatchCountryDialCodeInput,
} from "../../../types";
import { isQueryInitialLoad } from "../../../utils/query";
import {
  CountryDialCodeFormModal,
  defaultCountryDialCodeFormValues,
  type CountryDialCodeFormValues,
} from "./components/CountryDialCodeFormModal";
import { CountryDialCodesTable } from "./components/CountryDialCodesTable";

type CountryCodesTab = "active" | "archived";

const COUNTRY_CODES_TAB_IDS = [
  "active",
  "archived",
] as const satisfies readonly CountryCodesTab[];

const parseNationalLength = (value: string): number | null => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const toFormValues = (
  country: CountryDialCodeRecord,
): CountryDialCodeFormValues => ({
  code: country.code,
  name: country.name,
  dialCode: country.dialCode,
  minNationalLength: String(country.minNationalLength),
  maxNationalLength: String(country.maxNationalLength),
});

const isFormComplete = (form: CountryDialCodeFormValues): boolean => {
  const min = parseNationalLength(form.minNationalLength);
  const max = parseNationalLength(form.maxNationalLength);

  return Boolean(
    form.code.trim() &&
    form.name.trim() &&
    form.dialCode.trim() &&
    min !== null &&
    max !== null &&
    min >= 1 &&
    max >= 1 &&
    min <= max,
  );
};

export const PlatformCountryCodesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { activeTab, setActiveTab } = useTabUrlState(COUNTRY_CODES_TAB_IDS, {
    defaultTab: "active",
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CountryDialCodeFormValues>(
    defaultCountryDialCodeFormValues(),
  );
  const [editTarget, setEditTarget] = useState<CountryDialCodeRecord | null>(
    null,
  );
  const [editForm, setEditForm] = useState<CountryDialCodeFormValues>(
    defaultCountryDialCodeFormValues(),
  );
  const [archiveLoadingId, setArchiveLoadingId] = useState<string | null>(null);
  const [restoreLoadingId, setRestoreLoadingId] = useState<string | null>(null);

  const countryDialCodesQuery = useQuery({
    queryKey: ["platform", "country-dial-codes", "all"],
    queryFn: () => fetchManagedCountryDialCodes(true),
    enabled: user?.role === "super_admin",
  });

  const allCountryDialCodes =
    countryDialCodesQuery.data?.countryDialCodes ?? [];
  const activeCountryDialCodes = allCountryDialCodes.filter(
    (country) => !country.isArchived,
  );
  const archivedCountryDialCodes = allCountryDialCodes.filter(
    (country) => country.isArchived,
  );

  const invalidateCountryDialCodes = () => {
    void queryClient.invalidateQueries({
      queryKey: ["platform", "country-dial-codes"],
    });
    void queryClient.invalidateQueries({ queryKey: ["country-dial-codes"] });
  };

  const createMutation = useMutation({
    mutationFn: createCountryDialCode,
    onSuccess: () => {
      toast.success("Country code added.");
      setCreateOpen(false);
      setCreateForm(defaultCountryDialCodeFormValues());
      invalidateCountryDialCodes();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to add country code",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: PatchCountryDialCodeInput;
    }) => updateCountryDialCode(id, input),
    onSuccess: (_, variables) => {
      if (variables.input.isArchived === true) {
        toast.success("Country code archived.");
      } else if (variables.input.isArchived === false) {
        toast.success("Country code restored.");
      } else {
        toast.success("Country code updated.");
        setEditTarget(null);
        setEditForm(defaultCountryDialCodeFormValues());
      }
      setArchiveLoadingId(null);
      setRestoreLoadingId(null);
      invalidateCountryDialCodes();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to update country code",
      );
      setArchiveLoadingId(null);
      setRestoreLoadingId(null);
    },
  });

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    const minNationalLength = parseNationalLength(createForm.minNationalLength);
    const maxNationalLength = parseNationalLength(createForm.maxNationalLength);
    if (minNationalLength === null || maxNationalLength === null) {
      return;
    }

    createMutation.mutate({
      code: createForm.code.trim(),
      name: createForm.name.trim(),
      dialCode: createForm.dialCode.trim(),
      minNationalLength,
      maxNationalLength,
    });
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget) {
      return;
    }

    const minNationalLength = parseNationalLength(editForm.minNationalLength);
    const maxNationalLength = parseNationalLength(editForm.maxNationalLength);
    if (minNationalLength === null || maxNationalLength === null) {
      return;
    }

    const input: PatchCountryDialCodeInput = {};

    if (editForm.code.trim() !== editTarget.code) {
      input.code = editForm.code.trim();
    }
    if (editForm.name.trim() !== editTarget.name) {
      input.name = editForm.name.trim();
    }
    if (editForm.dialCode.trim() !== editTarget.dialCode) {
      input.dialCode = editForm.dialCode.trim();
    }
    if (minNationalLength !== editTarget.minNationalLength) {
      input.minNationalLength = minNationalLength;
    }
    if (maxNationalLength !== editTarget.maxNationalLength) {
      input.maxNationalLength = maxNationalLength;
    }

    if (Object.keys(input).length === 0) {
      return;
    }

    updateMutation.mutate({ id: editTarget.id, input });
  };

  const handleArchive = (country: CountryDialCodeRecord) => {
    setArchiveLoadingId(country.id);
    updateMutation.mutate({ id: country.id, input: { isArchived: true } });
  };

  const handleRestore = (country: CountryDialCodeRecord) => {
    setRestoreLoadingId(country.id);
    updateMutation.mutate({ id: country.id, input: { isArchived: false } });
  };

  if (user?.role !== "super_admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const tableProps = {
    loading: isQueryInitialLoad(countryDialCodesQuery),
    onEdit: (country: CountryDialCodeRecord) => {
      setEditTarget(country);
      setEditForm(toFormValues(country));
    },
    onArchive: handleArchive,
    onRestore: handleRestore,
    archiveLoadingId,
    restoreLoadingId,
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        back={{ to: "/dashboard", label: "Back to dashboard" }}
        label="Platform"
        title="Country codes"
        description="Manage the global dial code list and national number length rules for all companies."
        action={
          <Button
            type="button"
            icon={<HiPlus className="h-4 w-4 text-white" />}
            onClick={() => setCreateOpen(true)}
          >
            Add country code
          </Button>
        }
      />

      <TabGroup<CountryCodesTab>
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: "active",
            label: "Active",
            count: activeCountryDialCodes.length,
            content: (
              <CountryDialCodesTable
                countryDialCodes={activeCountryDialCodes}
                {...tableProps}
              />
            ),
          },
          {
            id: "archived",
            label: "Archived",
            count: archivedCountryDialCodes.length,
            content: (
              <CountryDialCodesTable
                countryDialCodes={archivedCountryDialCodes}
                {...tableProps}
              />
            ),
          },
        ]}
      />

      <CountryDialCodeFormModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateForm(defaultCountryDialCodeFormValues());
        }}
        onSubmit={handleCreateSubmit}
        title="Add country code"
        description="Add a country, dial code, and allowed national number length."
        submitLabel="Add country code"
        values={createForm}
        onChange={(field, value) =>
          setCreateForm((prev) => ({ ...prev, [field]: value }))
        }
        loading={createMutation.isPending}
        submitDisabled={!isFormComplete(createForm)}
      />

      <CountryDialCodeFormModal
        open={Boolean(editTarget)}
        onClose={() => {
          setEditTarget(null);
          setEditForm(defaultCountryDialCodeFormValues());
        }}
        onSubmit={handleEditSubmit}
        title="Edit country code"
        description="Update the country details or national number length rules."
        submitLabel="Save changes"
        values={editForm}
        onChange={(field, value) =>
          setEditForm((prev) => ({ ...prev, [field]: value }))
        }
        loading={updateMutation.isPending}
        submitDisabled={
          !editTarget ||
          !isFormComplete(editForm) ||
          (editForm.code.trim() === editTarget.code &&
            editForm.name.trim() === editTarget.name &&
            editForm.dialCode.trim() === editTarget.dialCode &&
            parseNationalLength(editForm.minNationalLength) ===
              editTarget.minNationalLength &&
            parseNationalLength(editForm.maxNationalLength) ===
              editTarget.maxNationalLength)
        }
      />
    </PageContainer>
  );
};
