import {
  HiBriefcase,
  HiEnvelope,
  HiIdentification,
  HiMapPin,
  HiPhone,
  HiShieldCheck,
} from "react-icons/hi2";
import type { ReactNode } from "react";
import { ThemeBannerBackground } from "../../../components/ThemeBannerBackground";
import { UserAvatar } from "../../../components/UserAvatar";
import type { AuthUser, MyEmployeeProfile, UserProfile } from "../../../types";
import { useCountryDialCodes } from "../../../hooks/useCountryDialCodes";
import { formatPhone } from "../../../utils/phone";
import { displayName, roleLabel } from "../../../utils/user";

interface ProfileHeaderBannerProps {
  user: AuthUser;
  profile: UserProfile;
  employee?: MyEmployeeProfile | null;
  clockedIn?: boolean;
}

const AttendanceBadge = ({ clockedIn }: { clockedIn: boolean }) => {
  return (
    <span
      className={`inline-flex shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
        clockedIn ? "bg-emerald-500" : "bg-sky-500"
      }`}
    >
      {clockedIn ? "Clocked in" : "Not in yet"}
    </span>
  );
};

const InfoItem = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) => {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-white">
      <span className="shrink-0 text-slate-400">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  );
};

const formatLocation = (
  companyName?: string,
  locationName?: string,
): string | null => {
  if (companyName && locationName) {
    return `${companyName} - ${locationName}`;
  }
  return companyName ?? locationName ?? null;
};

export const ProfileHeaderBanner = ({
  user,
  profile,
  employee,
  clockedIn,
}: ProfileHeaderBannerProps) => {
  const { dialCodeOptions, defaultDialCode } = useCountryDialCodes();
  const name = displayName(user);
  const email = employee?.email ?? profile.email;
  const phone = employee?.phone;
  const jobTitle = employee?.jobTitle;
  const employeeNumber = employee?.employeeNumber;
  const location = formatLocation(
    profile.companyName,
    employee?.defaultLocationName,
  );
  const showAttendanceBadge = clockedIn !== undefined;

  return (
    <section className="overflow-hidden rounded-xl shadow-sm">
      <ThemeBannerBackground className="px-5 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UserAvatar
            user={user}
            variant="onBrand"
            className="h-20 w-20 ring-4 ring-white/20 md:h-24 md:w-24"
            textClassName="text-2xl"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                {name}
              </h2>
              {showAttendanceBadge && <AttendanceBadge clockedIn={clockedIn} />}
            </div>

            {jobTitle && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/90 md:text-base">
                <HiBriefcase className="h-4 w-4 shrink-0" aria-hidden />
                <span>{jobTitle}</span>
              </p>
            )}
          </div>
        </div>
      </ThemeBannerBackground>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-slate-900 px-5 py-4 md:gap-x-8 md:px-8">
        <InfoItem icon={<HiEnvelope className="h-4 w-4" />}>
          <a
            href={`mailto:${email}`}
            className="text-cyan-400 hover:text-cyan-300"
          >
            {email}
          </a>
        </InfoItem>

        <InfoItem icon={<HiShieldCheck className="h-4 w-4" />}>
          {roleLabel(user.role)}
        </InfoItem>

        {phone && (
          <InfoItem icon={<HiPhone className="h-4 w-4" />}>
            <a href={`tel:${phone}`} className="hover:text-slate-200">
              {formatPhone(phone, dialCodeOptions, defaultDialCode)}
            </a>
          </InfoItem>
        )}

        {location && (
          <InfoItem icon={<HiMapPin className="h-4 w-4" />}>
            {location}
          </InfoItem>
        )}

        {employeeNumber && (
          <InfoItem icon={<HiIdentification className="h-4 w-4" />}>
            {employeeNumber}
          </InfoItem>
        )}
      </div>
    </section>
  );
};
