import { useState } from "react";
import { useRouter } from "next/navigation";
import { AcademicPlan } from "@/types";
import { PlanService } from "@/services/planService";
import {
  downloadFile,
  generatePlanFilename,
  formatPlanForExport,
  copyToClipboard,
  generateShareableUrl,
} from "@/utils/fileUtils";

export interface UsePlanActionsOptions {
  onPlanUpdated?: (updatedPlan: AcademicPlan) => void;
  onPlanCreated?: (newPlan: AcademicPlan) => void;
  onPlanDeleted?: (planId: string) => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export function usePlanActions(options: UsePlanActionsOptions = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const viewPlan = (plan: AcademicPlan) => {
    router.push(`/planner?id=${plan.id}`);
  };

  const editPlan = (plan: AcademicPlan) => {
    router.push(`/generate?edit=${plan.id}`);
  };

  const renamePlan = async (planId: string, newName: string) => {
    try {
      setLoading(true);
      const updatedPlan = await PlanService.updatePlan(planId, {
        name: newName,
      });
      options.onPlanUpdated?.(updatedPlan);
      options.onSuccess?.("Plan renamed successfully");
      return updatedPlan;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to rename plan";
      options.onError?.(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      setLoading(true);
      await PlanService.deletePlan(planId);
      options.onPlanDeleted?.(planId);
      options.onSuccess?.("Plan deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete plan";
      options.onError?.(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sharePlan = async (planId: string, isPublic: boolean = true) => {
    try {
      setLoading(true);
      const { url } = await PlanService.sharePlan(planId, { isPublic });
      const shareableUrl = generateShareableUrl(url.split("/").pop()!);
      await copyToClipboard(shareableUrl);
      options.onSuccess?.("Share link copied to clipboard");
      return shareableUrl;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create share link";
      options.onError?.(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadPlan = async (
    plan: AcademicPlan,
    format: "pdf" | "csv" | "json" = "pdf"
  ) => {
    try {
      setLoading(true);

      if (format === "json") {
        // Handle JSON export locally
        const exportData = formatPlanForExport(plan);
        const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        });
        const filename = generatePlanFilename(plan, "json");
        downloadFile(jsonBlob, filename);
        options.onSuccess?.("Plan exported as JSON");
      } else if (format === "csv") {
        // Handle CSV export locally
        const exportData = formatPlanForExport(plan);
        const csvContent = convertToCSV(exportData);
        const csvBlob = new Blob([csvContent], { type: "text/csv" });
        const filename = generatePlanFilename(plan, "csv");
        downloadFile(csvBlob, filename);
        options.onSuccess?.("Plan exported as CSV");
      } else {
        // Handle PDF export via API
        const blob = await PlanService.exportPlan(plan, format);
        const filename = generatePlanFilename(plan, format);
        downloadFile(blob, filename);
        options.onSuccess?.(`Plan exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to export plan as ${format}`;
      options.onError?.(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const duplicatePlan = async (plan: AcademicPlan) => {
    try {
      setLoading(true);
      const duplicatedPlan = await PlanService.duplicatePlan(plan.id);

      // Add the duplicated plan to the list instead of navigating
      options.onPlanCreated?.(duplicatedPlan);
      options.onSuccess?.("Plan duplicated successfully");
      return duplicatedPlan;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to duplicate plan";
      options.onError?.(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    viewPlan,
    editPlan,
    renamePlan,
    deletePlan,
    sharePlan,
    downloadPlan,
    duplicatePlan,
  };
}

function convertToCSV(data: any): string {
  const headers = [
    "Semester",
    "Season",
    "Year",
    "Course Code",
    "Course Title",
    "Credits",
    "Type",
  ];
  const rows = [headers.join(",")];

  data.semesters.forEach((semester: any) => {
    semester.courses.forEach((course: any) => {
      const row = [
        `"${semester.name}"`,
        semester.season,
        semester.year,
        `"${course.code}"`,
        `"${course.title}"`,
        course.credits,
        `"${course.type}"`,
      ];
      rows.push(row.join(","));
    });
  });

  return rows.join("\n");
}
