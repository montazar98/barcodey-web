import { NextResponse } from "next/server";
import db from "@/lib/db";
import { seedFeatureFlags, seedSiteConfig } from "@/lib/services";

export async function GET() {
  try {
    await seedFeatureFlags();
    await seedSiteConfig();

    const [configs, flags] = await Promise.all([
      db.siteConfig.findMany({
        where: {
          key: {
            in: [
              "site_name",
              "site_description",
              "adsense_id",
              "adsense_slot_top",
              "adsense_slot_bottom",
              "pro_price_monthly",
              "biz_price_monthly",
            ],
          },
        },
      }),
      db.featureFlag.findMany({
        select: {
          key: true,
          isEnabled: true,
          requiresAuth: true,
          minPlan: true,
        },
      }),
    ]);

    const configMap = Object.fromEntries(configs.map((c) => [c.key, c.value]));
    const flagsMap = Object.fromEntries(flags.map((f) => [f.key, f.isEnabled]));

    return NextResponse.json({
      config: configMap,
      features: flagsMap,
    });
  } catch {
    return NextResponse.json({ config: {}, features: {} });
  }
}
