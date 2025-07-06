#!/usr/bin/env ts-node
import { syncAws, syncGcp, syncAzure, syncGrid } from "./suppliers";
import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

(async () => {
  const data = {
    aws: await syncAws(),
    gcp: await syncGcp(),
    azure: await syncAzure(),
    grid: await syncGrid(),
  };
  writeFileSync("supabase/seed/latest.json", JSON.stringify(data, null, 2));
  const diff = spawnSync("git", ["diff", "--exit-code", "supabase/seed/latest.json"]);
  if (diff.status !== 0) {
    process.exit(1);
  }
})();
