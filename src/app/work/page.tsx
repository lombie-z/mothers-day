import client from "../../../tina/__generated__/client";
import WorkPage from "@/components/WorkPage";

export default async function Work() {
  const res = await client.queries.portfolio({
    relativePath: "portfolio.json",
  }).catch(() => null);

  return (
    <WorkPage
      query={res?.query ?? ""}
      variables={res?.variables ?? {}}
      data={res?.data ?? null}
    />
  );
}
