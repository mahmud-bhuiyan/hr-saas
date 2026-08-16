import type { LogoObjectFit, LogoShape } from "../types";

/** @deprecated Prefer LogoShape — kept as an alias for existing imports. */
export type BrandAssetShape = LogoShape;

const shapeClassName: Record<LogoShape, string> = {
  default: "rounded-md",
  rounded: "rounded-xl",
  circle: "rounded-full",
  square: "rounded-none",
};

export interface BrandAssetImageProps {
  src: string;
  alt?: string;
  /** Clip shape applied to the source image. */
  shape?: LogoShape;
  /** Height in px. Circle/square use equal width and cover-crop. */
  size?: number;
  /** Max width for default/rounded (ignored for circle/square). */
  maxWidth?: number;
  objectFit?: LogoObjectFit;
  /** Force a fixed square thumbnail (form previews). */
  thumbnail?: boolean;
  className?: string;
}

export const BrandAssetImage = ({
  src,
  alt = "",
  shape = "default",
  size = 40,
  maxWidth,
  objectFit,
  thumbnail = false,
  className = "",
}: BrandAssetImageProps) => {
  const isFixedSquare = thumbnail || shape === "circle" || shape === "square";
  const fit = objectFit ?? (isFixedSquare ? "cover" : "contain");

  return (
    <img
      src={src}
      alt={alt}
      className={`inline-block shrink-0 overflow-hidden ${shapeClassName[shape]} ${className}`.trim()}
      style={
        isFixedSquare
          ? { width: size, height: size, objectFit: fit }
          : {
              height: size,
              width: "auto",
              maxWidth: maxWidth ?? size * 4,
              objectFit: fit,
            }
      }
    />
  );
};
