<script lang="ts">
  import { Loader2, LogIn } from "lucide-svelte";

  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import { goto, invalidateAll } from "$app/navigation";
  import { onMount } from "svelte";

  let { data } = $props();
  let busy = $state(false);
  let googleBusy = $state(false);
  let googleCredential = $state("");
  let googleForm: HTMLFormElement | undefined = $state();
  let googleButton: HTMLDivElement | undefined = $state();
  let googleClientId = $derived(data.googleClientId || "");

  onMount(() => {
    if (!googleClientId) return;

    const renderGoogle = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !googleButton) return;
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: { credential?: string }) => {
          if (!response.credential) {
            toast.error("Google sign in failed");
            return;
          }
          googleCredential = response.credential;
          googleBusy = true;
          queueMicrotask(() => googleForm?.requestSubmit());
        }
      });
      google.accounts.id.renderButton(googleButton, {
        theme: "outline",
        size: "large",
        width: Math.min(360, googleButton.clientWidth || 360),
        text: "signin_with",
        shape: "rectangular"
      });
    };

    if ((window as any).google?.accounts?.id) {
      renderGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogle;
    document.head.appendChild(script);
  });
</script>

<svelte:head>
  <title>Sign in — NovelHive</title>
</svelte:head>

<main class="mx-auto grid min-h-[80vh] w-full max-w-md place-items-center px-4 py-10">
  <div class="w-full rounded-3xl border border-white/10 bg-card/70 p-7 shadow-elevated backdrop-blur">
    <div class="mb-6 text-center">
      <img src="/logo.ico" alt="NovelHive Logo" class="mx-auto h-12 w-12" />
      <h1 class="mt-4 font-display text-2xl font-extrabold">Welcome back</h1>
      <p class="mt-1 text-sm text-muted-foreground">Sign in to continue your story</p>
    </div>

    <form 
      method="POST" 
      action="?/login"
      class="space-y-3"
      use:enhance={() => {
        busy = true;
        return async ({ result }) => {
          busy = false;
          if (result.type === 'redirect') {
            toast.success("Welcome back");
            await invalidateAll();
            goto(result.location);
          } else if (result.type === 'failure') {
            toast.error(String(result.data?.error || "Invalid email or password"));
          }
        };
      }}
    >
      <div>
        <label for="email" class="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
        <input
          id="email"
          required type="email" name="email"
          placeholder="you@example.com"
          class="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
      <div>
        <label for="password" class="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
        <input
          id="password"
          required type="password" name="password"
          placeholder="••••••••"
          class="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
      <button
        disabled={busy}
        class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-2.5 text-sm font-bold text-white shadow-glow disabled:opacity-60"
      >
        {#if busy}
          <Loader2 class="h-4 w-4 animate-spin" />
          Signing in…
        {:else}
          <LogIn class="h-4 w-4" />
          Sign in
        {/if}
      </button>
    </form>

    {#if googleClientId}
      <div class="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
        <div class="h-px flex-1 bg-white/10"></div>
        <span>or</span>
        <div class="h-px flex-1 bg-white/10"></div>
      </div>

      <form
        method="POST"
        action="?/google"
        bind:this={googleForm}
        use:enhance={() => {
          googleBusy = true;
          return async ({ result }) => {
            googleBusy = false;
            if (result.type === "redirect") {
              toast.success("Welcome back");
              await invalidateAll();
              goto(result.location);
            } else if (result.type === "failure") {
              toast.error(String(result.data?.error || "Google sign in failed"));
            }
          };
        }}
      >
        <input type="hidden" name="credential" bind:value={googleCredential} />
        <div class="min-h-10" class:opacity-60={googleBusy} bind:this={googleButton}></div>
      </form>
    {/if}

    <p class="mt-6 text-center text-sm text-muted-foreground">
      New here? <a href="/register" class="font-bold gradient-text">Create an account</a>
    </p>
  </div>
</main>
