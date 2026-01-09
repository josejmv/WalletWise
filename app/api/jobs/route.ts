import { NextResponse } from "next/server";
import {
  getJobs,
  getActiveJobs,
  createJob,
  getTotalMonthlyIncome,
} from "./service";
import { createJobSchema } from "./schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const currencyId = searchParams.get("currencyId");
    const accountId = searchParams.get("accountId");
    const activeOnly = searchParams.get("activeOnly");
    const monthlyTotal = searchParams.get("monthlyTotal");

    if (monthlyTotal === "true") {
      const total = await getTotalMonthlyIncome();
      return NextResponse.json({ success: true, data: { total } });
    }

    if (activeOnly === "true") {
      const jobs = await getActiveJobs();
      return NextResponse.json({ success: true, data: jobs });
    }

    const filters = {
      ...(type && { type: type as "fixed" | "freelance" }),
      ...(status && { status: status as "active" | "archived" | "pending" }),
      ...(currencyId && { currencyId }),
      ...(accountId && { accountId }),
    };

    const jobs = await getJobs(
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al obtener trabajos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const job = await createJob(parsed.data);
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear trabajo";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
