import { AcademicPlan } from "@/types";

export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function generatePlanFilename(
  plan: AcademicPlan,
  format: string
): string {
  const sanitizedName = plan.name.replace(/[^a-zA-Z0-9]/g, "_");
  const timestamp = new Date().toISOString().split("T")[0];
  return `${sanitizedName}_${timestamp}.${format}`;
}

export function formatPlanForExport(plan: AcademicPlan) {
  return {
    name: plan.name,
    duration: `${plan.startSemester?.season || "Fall"} ${plan.startSemester?.year || new Date().getFullYear()} - ${plan.endSemester?.season || "Spring"} ${plan.endSemester?.year || new Date().getFullYear() + 4}`,
    totalCredits: (plan.semesters || []).reduce(
      (sum, sem) => sum + (sem.totalCredits || 0),
      0
    ),
    semesters:
      plan.semesters?.map((semester) => ({
        name: semester.name,
        season: semester.season,
        year: semester.year,
        credits: semester.totalCredits,
        courses:
          semester.courses?.map((course) => ({
            code: course.code,
            title: course.title,
            credits: course.credits,
            type: course.type,
          })) || [],
      })) || [],
    majors: plan.majors?.map((m) => m.name) || [],
    minors: plan.minors?.map((m) => m.name) || [],
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    return new Promise((resolve, reject) => {
      try {
        document.execCommand("copy");
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textArea);
      }
    });
  }
}

export function generateShareableUrl(shareToken: string): string {
  return `${window.location.origin}/share/${shareToken}`;
}
