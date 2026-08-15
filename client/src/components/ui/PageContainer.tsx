import type { ReactNode } from "react";

type PageContainerMaxWidth = "lg" | "xl" | "2xl";

interface PageContainerProps {
  children: ReactNode;
  /** Vertical spacing between page sections. Defaults to `space-y-6`. */
  className?: string;
  /** Omit top padding so a bleed `NavTabBar` can sit flush under the app header. */
  flushTop?: boolean;
  /** Centers page content and caps width — for single-form settings pages. */
  maxWidth?: PageContainerMaxWidth;
}

const maxWidthClasses: Record<PageContainerMaxWidth, string> = {
  lg: "mx-auto max-w-lg",
  xl: "mx-auto max-w-xl",
  "2xl": "mx-auto max-w-2xl",
};

export const PageContainer = ({
  children,
  className = "space-y-6",
  flushTop = false,
  maxWidth,
}: PageContainerProps) => {
  const widthClass = maxWidth ? maxWidthClasses[maxWidth] : "";
  const topPaddingClass = flushTop ? "" : "pt-6";

  return (
    <div
      className={`w-full ${widthClass} ${topPaddingClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
};
