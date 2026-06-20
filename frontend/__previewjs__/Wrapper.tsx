// __previewjs__/Wrapper.tsx

import { ReactNode } from "react";

import "../styles/global.css";
import "@previewjs/config-helper-nextjs";
export function Wrapper({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
