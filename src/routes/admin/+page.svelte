<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { adminStore } from "$lib/state/admin.svelte";
  import AdminSidebar from "$lib/components/admin/AdminSidebar.svelte";
  import AdminStats from "$lib/components/admin/AdminStats.svelte";
  import NovelView from "$lib/components/admin/NovelView.svelte";
  import ChapterView from "$lib/components/admin/ChapterView.svelte";
  import GenreView from "$lib/components/admin/GenreView.svelte";
  import UserView from "$lib/components/admin/UserView.svelte";
  import NovelModal from "$lib/components/admin/NovelModal.svelte";

  let user = $derived($page.data.user);
  let tab = $state("novels");

  $effect(() => {
    if (user && user.role !== "admin") {
      goto("/");
    }
  });

  $effect(() => {
    if (user?.role === "admin") {
      if (tab === "novels") adminStore.loadNovels();
      else if (tab === "chapters") adminStore.loadChapters();
      else if (tab === "genres") adminStore.loadGenres();
      else if (tab === "users") adminStore.loadUsers();
    }
  });
</script>

<svelte:head>
  <title>Admin Dashboard - NovelHive</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <main class="container mx-auto px-4 py-8 md:py-20">
    <div class="flex flex-col gap-8 md:flex-row md:items-start">
      <div class="w-full md:w-64 shrink-0">
        <AdminSidebar bind:tab />
      </div>

      <div class="flex-1 overflow-hidden">
        {#if adminStore.busy}
          <div class="grid h-64 place-items-center">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
          </div>
        {:else}
          <AdminStats />

          {#if tab === "novels"}
            <NovelView />
          {:else if tab === "chapters"}
            <ChapterView />
          {:else if tab === "genres"}
            <GenreView />
          {:else if tab === "users"}
            <UserView />
          {/if}
        {/if}
      </div>
    </div>
  </main>
</div>

<NovelModal />
