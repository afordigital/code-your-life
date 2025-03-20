import React from "react";
import { SVGProps } from "react";
interface Props {
  svgProps?: SVGProps<SVGSVGElement>;
  className?: string;
}
export function Moon({ svgProps, className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      {...svgProps}
      className={`${className} lucide lucide-moon`}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
