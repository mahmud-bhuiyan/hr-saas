import type { ComponentProps, ReactNode } from "react";
import { PageHeader } from "../../../../components/layout/PageHeader";
import { ADMIN_SETTINGS_PATH } from "../../utils";

type PageHeaderActionAlign = NonNullable<
  ComponentProps<typeof PageHeader>["actionAlign"]
>;

interface SettingsPageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  actionAlign?: PageHeaderActionAlign;
}

export const SettingsPageHeader = ({
  title,
  description,
  action,
  actionAlign,
}: SettingsPageHeaderProps) => (
  <PageHeader
    back={{ to: ADMIN_SETTINGS_PATH, label: "Back to settings" }}
    label="Settings"
    title={title}
    description={description}
    action={action}
    actionAlign={actionAlign}
  />
);
