<script lang="ts">
  import { confirmStore } from "$lib/state/confirm.svelte";
  import { Loader2, AlertTriangle, Info, Trash2 } from "lucide-svelte";
  import { cn } from "$lib/utils";
</script>

{#if confirmStore.show}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">

    <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" onclick={() => !confirmStore.loading && confirmStore.onCancel()}></div>
    
    <div class="relative w-full max-w-sm rounded-3xl border border-white/10 bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      
      <div class="mb-4 flex items-center justify-center">
        <div class={cn(
          "grid h-12 w-12 place-items-center rounded-full",
          confirmStore.type === "danger" ? "bg-destructive/10 text-destructive" :
          confirmStore.type === "warning" ? "bg-warning/10 text-warning" :
          "bg-brand/10 text-brand"
        )}>
          {#if confirmStore.type === "danger"}
            <Trash2 class="h-6 w-6" />
          {:else if confirmStore.type === "warning"}
            <AlertTriangle class="h-6 w-6" />
          {:else}
            <Info class="h-6 w-6" />
          {/if}
        </div>
      </div>
      
      <h2 class="text-center font-display text-xl font-extrabold">{confirmStore.title}</h2>
      <p class="mt-2 text-center text-sm text-muted-foreground">
        {@html confirmStore.message}
      </p>
      
      <div class="mt-6 flex gap-3">
        <button 
          onclick={() => confirmStore.onCancel()} 
          disabled={confirmStore.loading}
          class="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/10 disabled:opacity-50"
        >
          {confirmStore.cancelText}
        </button>
        <button 
          onclick={() => confirmStore.onConfirm()}
          disabled={confirmStore.loading}
          class={cn(
            "flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-glow transition hover:opacity-90 disabled:opacity-50",
            confirmStore.type === "danger" ? "bg-destructive" :
            confirmStore.type === "warning" ? "bg-warning" :
            "gradient-brand"
          )}
        >
          {#if confirmStore.loading}
            <Loader2 class="h-4 w-4 animate-spin" />
          {/if}
          {confirmStore.confirmText}
        </button>
      </div>
      
    </div>
  </div>
{/if}
