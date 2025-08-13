// src/app/api/admin/logs/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface SystemLog {
  id: string;
  type: string;
  action: string;
  description: string;
  userName?: string;
  severity: string;
  timestamp: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    // Get all logs for export (without pagination)
    const { searchParams } = new URL(request.url);
    const logsResponse = await fetch(
      `${
        request.nextUrl.origin
      }/api/admin/logs?limit=1000&${searchParams.toString()}`
    );
    const logsData = await logsResponse.json();

    if (!logsData.success) {
      return NextResponse.json(
        { success: false, error: "فشل في تحميل السجلات" },
        { status: 500 }
      );
    }

    const logs = logsData.data.logs;

    // Create CSV content
    const csvHeaders = [
      "ID",
      "Type",
      "Action",
      "Description",
      "User Name",
      "Severity",
      "Timestamp",
      "IP Address",
      "Metadata",
    ];

    const csvRows = logs.map((log: SystemLog) => [
      log.id,
      log.type,
      log.action,
      `"${log.description.replace(/"/g, '""')}"`, // Escape quotes
      log.userName || "",
      log.severity,
      log.timestamp,
      log.ipAddress || "",
      log.metadata
        ? `"${JSON.stringify(log.metadata).replace(/"/g, '""')}"`
        : "",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row: string[]) => row.join(",")),
    ].join("\n");

    // Add BOM for proper UTF-8 encoding in Excel
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="system-logs-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Log export error:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في التصدير" },
      { status: 500 }
    );
  }
}
