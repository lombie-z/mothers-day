import client from "../../tina/__generated__/client";
import HomePage from "@/components/HomePage";

export default async function Home() {
  const res = await client.queries.settings({
    relativePath: "settings.json",
  }).catch(() => null);

  return (
    <HomePage
      query={res?.query ?? ""}
      variables={res?.variables ?? {}}
      data={res?.data ?? null}
    />
  );
}
