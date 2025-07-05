import { syncAws, syncGcp, syncAzure, syncGrid } from "./suppliers";
import { writeFileSync } from "node:fs";

(async () => {
  const data = {
    aws: await syncAws(),
    gcp: await syncGcp(),
    azure: await syncAzure(),
    grid: await syncGrid(),
  };
  writeFileSync("supabase/seed/latest.json", JSON.stringify(data, null, 2));
})();
