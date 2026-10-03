import { notFound } from "next/navigation";
import client from "../../../tina/__generated__/client";
import WorkPage from "@/components/WorkPage";
import { artCategories } from "@/artCategories";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const artCategory = artCategories.find(({ slug }) => slug === category);
  if (!artCategory) notFound();

  const res = await client.queries[artCategory.slug]({
    relativePath: "portfolio.json",
  });

  return <WorkPage key={artCategory.slug} category={artCategory.slug} {...res} />;
}
