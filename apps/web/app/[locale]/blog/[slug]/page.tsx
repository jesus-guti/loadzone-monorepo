import { ArrowLeftIcon } from "@radix-ui/react-icons";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type BlogPostProperties = {
  readonly params: Promise<{ slug: string }>;
};

export const generateMetadata = async (): Promise<Metadata> => ({});

export const generateStaticParams = async (): Promise<{ slug: string }[]> => [];

const BlogPost = async ({ params }: BlogPostProperties) => {
  await params;
  notFound();
};

export default BlogPost;
