import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { withRequest } from "@/lib/logging/logger";
import { getUserOrThrow } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId);
  const start = Date.now();

  try {
    await getUserOrThrow();
    const body = await req.json();
    const { plan } = body;

    if (!plan) {
      const res = NextResponse.json(
        {
          code: "validation_failed",
          message: "Plan data is required",
        },
        { status: 400 }
      );
      res.headers.set("X-Request-Id", requestId);
      return res;
    }

    // For now, return a placeholder PDF
    // In a real implementation, you would use a PDF generation library
    // like puppeteer, jsPDF, or similar
    const pdfContent = generatePlaceholderPDF(plan);
    const blob = Buffer.from(pdfContent);

    const res = new NextResponse(blob, { status: 200 });
    res.headers.set("Content-Type", "application/pdf");
    res.headers.set(
      "Content-Disposition",
      `attachment; filename="${plan.name || "plan"}.pdf"`
    );
    res.headers.set("X-Request-Id", requestId);

    log.info(
      { status: 200, elapsedMs: Date.now() - start },
      "POST /api/plans/export"
    );
    return res;
  } catch (e: any) {
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? "unauthorized" : "internal";
    const res = NextResponse.json(
      {
        code,
        message: status === 401 ? "Unauthorized" : "Internal error",
      },
      { status }
    );
    res.headers.set("X-Request-Id", requestId);
    log.error(
      { error: e.message, requestId },
      "POST /api/plans/export - Error"
    );
    return res;
  }
}

function generatePlaceholderPDF(plan: any): string {
  // This is a minimal PDF structure - in production you'd use a proper PDF library
  return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 73
>>
stream
BT
/F1 24 Tf
50 750 Td
(Academic Plan: ${plan.name || "Untitled"}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000196 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
320
%%EOF`;
}
