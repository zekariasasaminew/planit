export type Diagnostic = { code: string; message: string; details?: Record<string, unknown> };

export class DiagnosticsCollector {
  private list: Diagnostic[] = [];
  add(code: string, message: string, details?: Record<string, unknown>) {
    this.list.push({ code, message, details });
  }
  all() {
    return this.list;
  }
}

