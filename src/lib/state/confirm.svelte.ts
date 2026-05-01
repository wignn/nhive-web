export class ConfirmState {
  show = $state(false);
  title = $state("");
  message = $state("");
  confirmText = $state("Confirm");
  cancelText = $state("Cancel");
  type = $state<"danger" | "warning" | "info">("danger");
  loading = $state(false);

  private resolve: ((val: boolean) => void) | null = null;

  prompt(options: {
    title: string;
    message: string;
    type?: "danger" | "warning" | "info";
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> {
    this.title = options.title;
    this.message = options.message;
    this.type = options.type || "danger";
    this.confirmText = options.confirmText || "Confirm";
    this.cancelText = options.cancelText || "Cancel";
    this.show = true;
    this.loading = false;

    return new Promise((res) => {
      this.resolve = res;
    });
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  onConfirm() {
    if (this.resolve) this.resolve(true);
  }

  onCancel() {
    if (this.resolve) this.resolve(false);
    this.show = false;
  }

  close() {
    this.show = false;
    this.loading = false;
  }
}

export const confirmStore = new ConfirmState();
