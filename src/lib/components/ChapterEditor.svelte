<script lang="ts">
  interface Props {
    content?: string;
    placeholder?: string;
  }

  let { content = $bindable(""), placeholder = "Start writing your chapter…" }: Props = $props();

  function autoResize(node: HTMLTextAreaElement) {
    function resize() {
      node.style.height = 'auto';
      node.style.height = Math.max(400, node.scrollHeight) + 'px';
    }
    resize();
    node.addEventListener('input', resize);
    requestAnimationFrame(resize);
    return {
      destroy() {
        node.removeEventListener('input', resize);
      }
    };
  }
</script>

<div class="editor-wrapper">
  <textarea
    use:autoResize
    {placeholder}
    bind:value={content}
    class="editor-textarea"
    spellcheck="true"
  ></textarea>
</div>

<style>
  .editor-wrapper {
    border: 1px solid oklch(0.30 0.025 270 / 0.6);
    border-radius: 0.75rem;
    overflow: hidden;
    background: oklch(0.18 0.02 270 / 0.5);
  }

  .editor-textarea {
    display: block;
    width: 100%;
    min-height: 400px;
    padding: 20px 24px;
    border: none;
    outline: none;
    resize: vertical;
    background: transparent;
    font-family: "Source Serif 4", "Iowan Old Style", Georgia, serif;
    font-size: 1.05rem;
    line-height: 1.75;
    color: oklch(0.92 0.005 270);
    white-space: pre-wrap;
    word-wrap: break-word;
    tab-size: 4;
  }

  .editor-textarea::placeholder {
    color: oklch(0.45 0.02 270);
    font-style: italic;
  }

  .editor-textarea::-webkit-scrollbar { width: 8px; }
  .editor-textarea::-webkit-scrollbar-track { background: transparent; }
  .editor-textarea::-webkit-scrollbar-thumb {
    background: oklch(0.30 0.03 270 / 0.5);
    border-radius: 999px;
  }
  .editor-textarea::-webkit-scrollbar-thumb:hover {
    background: oklch(0.58 0.23 25);
  }
</style>
