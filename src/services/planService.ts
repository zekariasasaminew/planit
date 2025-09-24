import { AcademicPlan } from "@/types";

export class PlanService {
  static async getPlans(): Promise<AcademicPlan[]> {
    const response = await fetch("/api/plans");
    if (!response.ok) {
      throw new Error("Failed to fetch plans");
    }
    return response.json();
  }

  static async getPlan(id: string): Promise<AcademicPlan> {
    const response = await fetch(`/api/plans/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch plan");
    }
    return response.json();
  }

  static async updatePlan(
    id: string,
    updates: { name?: string; preferences?: any }
  ): Promise<AcademicPlan> {
    const response = await fetch(`/api/plans/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("PlanService.updatePlan error:", errorText);
      throw new Error("Failed to update plan");
    }
    const result = await response.json();
    return result;
  }

  static async deletePlan(id: string): Promise<void> {
    const response = await fetch(`/api/plans/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete plan");
    }
  }

  static async duplicatePlan(planId: string): Promise<AcademicPlan> {
    const response = await fetch("/api/plans/duplicate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ planId }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("PlanService.duplicatePlan error:", errorText);
      throw new Error("Failed to duplicate plan");
    }
    const result = await response.json();
    return result;
  }

  static async sharePlan(
    planId: string,
    options: { isPublic?: boolean; expiresAt?: string } = {}
  ): Promise<{ url: string }> {
    const response = await fetch("/api/plans/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId,
        ...options,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to create share link");
    }
    return response.json();
  }

  static async exportPlan(
    plan: AcademicPlan,
    format: "pdf" | "csv" | "json" = "pdf"
  ): Promise<Blob> {
    const response = await fetch("/api/plans/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan, format }),
    });
    if (!response.ok) {
      throw new Error("Failed to export plan");
    }
    return response.blob();
  }
}
