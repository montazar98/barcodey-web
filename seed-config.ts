import { PrismaClient } from "@prisma/client";
import { DEFAULT_CONFIG } from "./src/lib/services";

const db = new PrismaClient();

async function run() {
  for (const cfg of DEFAULT_CONFIG) {
    await db.siteConfig.upsert({
      where: { key: cfg.key },
      update: { label: cfg.label, group: cfg.group, type: cfg.type, value: cfg.value },
      create: cfg,
    });
  }
  console.log("Done!");
}

run();
