import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getLatestRate,
  getRateViaIntermediate,
  type RateResult,
} from "@/lib/currency-utils";

const requestSchema = z.object({
  sourceCurrencyId: z.string().uuid(),
  targetCurrencyIds: z.array(z.string().uuid()),
  // Optional intermediate currency for forced routing
  intermediateCurrencyId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { sourceCurrencyId, targetCurrencyIds, intermediateCurrencyId } =
      parsed.data;

    // Fetch rates for all target currencies in parallel
    const ratePromises = targetCurrencyIds.map(async (targetId) => {
      let rate: RateResult | null;

      if (intermediateCurrencyId) {
        // Force routing via intermediate currency
        rate = await getRateViaIntermediate(
          sourceCurrencyId,
          targetId,
          intermediateCurrencyId,
        );
      } else {
        // Standard rate lookup (direct, inverse, or auto-intermediate)
        rate = await getLatestRate(sourceCurrencyId, targetId);
      }

      return [targetId, rate] as [string, RateResult | null];
    });

    const ratesArray = await Promise.all(ratePromises);
    const rates: Record<string, RateResult | null> =
      Object.fromEntries(ratesArray);

    return NextResponse.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error fetching rates";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
