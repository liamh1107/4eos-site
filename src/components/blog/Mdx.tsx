import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { ReactNode } from "react";

const components = {
  h2: (props: { children?: ReactNode }) => (
    <h2
      className="display mt-14 text-[clamp(1.5rem,2.6vw,2.2rem)]"
      {...props}
    />
  ),
  p: (props: { children?: ReactNode }) => (
    <p className="lede mt-6 max-w-[62ch] text-fg" {...props} />
  ),
  ul: (props: { children?: ReactNode }) => (
    <ul className="mt-6 space-y-3" {...props} />
  ),
  li: (props: { children?: ReactNode }) => (
    <li className="flex gap-4 text-[15px] tracking-tight">
      <span className="micro text-fg-faint" aria-hidden>
        ·
      </span>
      <span>{props.children}</span>
    </li>
  ),
  strong: (props: { children?: ReactNode }) => (
    <strong className="font-medium text-fg" {...props} />
  ),
};

export async function Mdx({ source }: { source: string }) {
  const compiled = String(
    await compile(source, { outputFormat: "function-body" }),
  );
  const { default: Content } = await run(compiled, {
    ...runtime,
    baseUrl: import.meta.url,
  });
  return <Content components={components} />;
}
