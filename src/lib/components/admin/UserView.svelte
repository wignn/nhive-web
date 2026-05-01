<script lang="ts">
  import { adminStore } from "$lib/state/admin.svelte";
  import { cn } from "$lib/utils";
  import { Shield, User } from "lucide-svelte";
</script>

<div class="mb-4 flex items-center justify-between">
  <h2 class="font-display text-xl font-extrabold capitalize">users</h2>
</div>

<div class="overflow-hidden rounded-2xl border border-white/5 bg-card/60">
  <table class="w-full text-left">
    <thead>
      <tr class="bg-white/[0.02]">
        {#each ["Username", "Email", "Role", ""] as h}
          <th class="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each adminStore.users as u}
        <tr class="border-t border-white/5">
          <td class="p-3 font-semibold">{u.username}</td>
          <td class="p-3 text-sm text-muted-foreground">{u.email}</td>
          <td class="p-3">
            <span
              class={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                u.role === "admin" ? "bg-brand/20 text-brand" : "bg-white/10 text-muted-foreground",
              )}>{u.role}</span
            >
          </td>
          <td class="p-3 text-right">
            <button
              onclick={() => adminStore.setUserRole(u.id, u.role)}
              class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
            >
              {#if u.role === "admin"}<User class="h-3.5 w-3.5" /> Make reader{:else}<Shield class="h-3.5 w-3.5" /> Make admin{/if}
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
