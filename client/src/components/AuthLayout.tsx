import { Link } from "react-router-dom";
import { BrandMark } from "./BrandMark";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left — hero image (split layout) */}
      <div className="relative hidden min-h-screen lg:block lg:w-[70%]">
        <img
          src="/images/login-image.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Right — form panel */}
      <div className="flex min-h-screen w-full flex-col lg:w-[30%]">
        <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {subtitle}
              </p>
            )}

            <div className="mt-8">{children}</div>

            {footer && (
              <div className="mt-8 text-center text-sm text-slate-500">
                {footer}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar — brand + disclaimer (aligned with form column) */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4 sm:px-10 lg:px-12 xl:px-16">
          <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-3">
            <Link to="/" className="inline-flex shrink-0" title="Home">
              <BrandMark compact />
            </Link>
            <p className="min-w-0 text-xs leading-snug text-slate-400">
              By signing in, you agree to our{" "}
              <Link
                to="/terms"
                className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
              >
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
