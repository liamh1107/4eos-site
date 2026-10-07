import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { BackLink } from "@/components/ui/BackLink";
import { Breath, Sheet } from "@/components/layout/Sheet";
import { getPosts } from "@/lib/posts";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/blog", {
  title: "Journal",
  description: "Notes on managed IT, security, and running a business in Fort Wayne.",
});

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <Page phase="discovery">
      <section className="px-[var(--sheet-inset)] pb-10 pt-[6vh]">
        <BackLink href="/" label="Home" />
        <p className="micro mt-6 text-fg-muted">
          <span className="field-copy">Journal</span>
        </p>
        <h1 className="display page-display mt-5 max-w-[14ch]">
          Notes from the work.
        </h1>
      </section>
      <Breath size="md" />
      <Sheet tone="ink">
        <ol className="sheet-pad divide-y divide-hairline py-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block py-10">
                <p className="micro text-fg-faint">
                  {formatDate(post.date)} · {post.author}
                </p>
                <h2 className="display mt-4 max-w-[22ch] text-[clamp(1.4rem,2.6vw,2rem)] group-hover:text-gold">
                  {post.title}
                </h2>
                <p className="lede mt-4 max-w-[56ch]">{post.description}</p>
              </Link>
            </li>
          ))}
        </ol>
      </Sheet>
    </Page>
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
