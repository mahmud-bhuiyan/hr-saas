import { ThemeBannerBackground } from '../../../components/ThemeBannerBackground';

interface DashboardWelcomeBannerProps {
  name: string;
}

export const DashboardWelcomeBanner = ({ name }: DashboardWelcomeBannerProps) => {
  return (
    <ThemeBannerBackground className="rounded-xl px-6 py-10 shadow-sm md:px-10 md:py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
        Welcome {name}!
      </h1>
    </ThemeBannerBackground>
  );
};
