import client from "../../tina/__generated__/client";
import { artCategories } from "@/artCategories";
import HomePage from "@/components/HomePage";

export default async function Home() {
  const res = await client.queries.settings({
    relativePath: "settings.json",
  }).catch(() => null);

  const portfolios = await Promise.all(
    artCategories.map(async (category) => {
      const result = await client.queries[category.slug]({ relativePath: "portfolio.json" });
      const data = result.data as Partial<Record<(typeof artCategories)[number]["slug"], { works?: unknown[] | null }>>;
      return data[category.slug]?.works?.length ? category : null;
    }),
  );

  return (
    <HomePage
      categories={portfolios.filter((category) => category !== null)}
      query={res?.query ?? ""}
      variables={res?.variables ?? {}}
      data={res?.data ?? null}
    />
  );
}
