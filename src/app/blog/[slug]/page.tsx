import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerPage } from "@/components/layout/InnerPage";
import { Mdx } from "@/components/blog/Mdx";
import { withCanonical } from "@/lib/metadata";
import { getPost, getPosts } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return withCanonical(`/blog/${post.slug}`, { title: post.title, description: post.description });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <InnerPage
      phase="discovery"
      kicker={`${formatDate(post.date)} · ${post.author}`}
      title={post.title}
      lede={post.description}
      backHref="/blog"
      backLabel="Journal"
    >
      <Mdx source={post.body} />
    </InnerPage>
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
