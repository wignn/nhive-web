<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import Underline from "@tiptap/extension-underline";
  import TextAlign from "@tiptap/extension-text-align";
  import Placeholder from "@tiptap/extension-placeholder";
  import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code2,
    Heading2,
    Heading3,
    Heading4,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo2,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo2,
    Minus,
  } from "lucide-svelte";

  interface Props {
    content?: string;
    onchange?: (html: string) => void;
    placeholder?: string;
  }

  let { content = "", onchange, placeholder = "Start writing your chapter…" }: Props = $props();

  let editorElement: HTMLDivElement;
  let editor: Editor | null = $state(null);

  onMount(() => {
    editor = new Editor({
      element: editorElement,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3, 4] },
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Placeholder.configure({
          placeholder,
        }),
      ],
      content: content || "",
      editorProps: {
        attributes: {
          class: "tiptap-content",
        },
      },
      onUpdate({ editor: e }) {
        onchange?.(e.getHTML());
      },
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });

  // Reactively update content when parent changes it (e.g. opening edit modal)
  $effect(() => {
    if (editor && content !== undefined) {
      const current = editor.getHTML();
      if (current !== content) {
        editor.commands.setContent(content || "", { emitUpdate: false });
      }
    }
  });

  type BtnDef = {
    icon: any;
    action: () => void;
    isActive: () => boolean;
    title: string;
  };

  type SepDef = { sep: true };

  function btns(): (BtnDef | SepDef)[] {
    if (!editor) return [];
    return [
      { icon: Undo2, action: () => editor!.chain().focus().undo().run(), isActive: () => false, title: "Undo" },
      { icon: Redo2, action: () => editor!.chain().focus().redo().run(), isActive: () => false, title: "Redo" },
      { sep: true },
      { icon: Bold, action: () => editor!.chain().focus().toggleBold().run(), isActive: () => editor!.isActive("bold"), title: "Bold" },
      { icon: Italic, action: () => editor!.chain().focus().toggleItalic().run(), isActive: () => editor!.isActive("italic"), title: "Italic" },
      { icon: UnderlineIcon, action: () => editor!.chain().focus().toggleUnderline().run(), isActive: () => editor!.isActive("underline"), title: "Underline" },
      { icon: Strikethrough, action: () => editor!.chain().focus().toggleStrike().run(), isActive: () => editor!.isActive("strike"), title: "Strikethrough" },
      { sep: true },
      { icon: Heading2, action: () => editor!.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor!.isActive("heading", { level: 2 }), title: "Heading 2" },
      { icon: Heading3, action: () => editor!.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor!.isActive("heading", { level: 3 }), title: "Heading 3" },
      { icon: Heading4, action: () => editor!.chain().focus().toggleHeading({ level: 4 }).run(), isActive: () => editor!.isActive("heading", { level: 4 }), title: "Heading 4" },
      { sep: true },
      { icon: List, action: () => editor!.chain().focus().toggleBulletList().run(), isActive: () => editor!.isActive("bulletList"), title: "Bullet list" },
      { icon: ListOrdered, action: () => editor!.chain().focus().toggleOrderedList().run(), isActive: () => editor!.isActive("orderedList"), title: "Ordered list" },
      { icon: Quote, action: () => editor!.chain().focus().toggleBlockquote().run(), isActive: () => editor!.isActive("blockquote"), title: "Quote" },
      { icon: Code2, action: () => editor!.chain().focus().toggleCodeBlock().run(), isActive: () => editor!.isActive("codeBlock"), title: "Code block" },
      { icon: Minus, action: () => editor!.chain().focus().setHorizontalRule().run(), isActive: () => false, title: "Horizontal rule" },
      { sep: true },
      { icon: AlignLeft, action: () => editor!.chain().focus().setTextAlign("left").run(), isActive: () => editor!.isActive({ textAlign: "left" }), title: "Align left" },
      { icon: AlignCenter, action: () => editor!.chain().focus().setTextAlign("center").run(), isActive: () => editor!.isActive({ textAlign: "center" }), title: "Align center" },
      { icon: AlignRight, action: () => editor!.chain().focus().setTextAlign("right").run(), isActive: () => editor!.isActive({ textAlign: "right" }), title: "Align right" },
      { icon: AlignJustify, action: () => editor!.chain().focus().setTextAlign("justify").run(), isActive: () => editor!.isActive({ textAlign: "justify" }), title: "Justify" },
    ];
  }

  function isSep(b: BtnDef | SepDef): b is SepDef {
    return "sep" in b;
  }
</script>

<div class="tiptap-wrapper">
  <!-- Toolbar -->
  <div class="tiptap-toolbar">
    {#each btns() as b, i}
      {#if isSep(b)}
        <div class="tiptap-sep"></div>
      {:else}
        {@const Icon = b.icon}
        <button
          type="button"
          onclick={(e) => { e.preventDefault(); b.action(); }}
          class="tiptap-btn"
          class:active={b.isActive()}
          title={b.title}
        >
          <Icon size={15} strokeWidth={2.2} />
        </button>
      {/if}
    {/each}
  </div>

  <!-- Editor area -->
  <div bind:this={editorElement} class="tiptap-editor"></div>
</div>

<style>
  .tiptap-wrapper {
    border: 1px solid oklch(0.30 0.025 270 / 0.6);
    border-radius: 0.75rem;
    overflow: hidden;
    background: oklch(0.18 0.02 270 / 0.5);
  }

  .tiptap-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 6px 8px;
    background: oklch(0.16 0.02 270 / 0.8);
    border-bottom: 1px solid oklch(0.30 0.025 270 / 0.5);
  }

  .tiptap-btn {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: oklch(0.72 0.02 270);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .tiptap-btn:hover {
    background: oklch(1 0 0 / 0.08);
    color: oklch(0.97 0.005 270);
  }
  .tiptap-btn.active {
    background: oklch(0.58 0.23 25 / 0.2);
    color: oklch(0.65 0.25 20);
  }

  .tiptap-sep {
    width: 1px;
    height: 22px;
    margin: 4px 4px;
    background: oklch(0.30 0.025 270 / 0.5);
  }

  .tiptap-editor {
    min-height: 350px;
    max-height: 60vh;
    overflow-y: auto;
  }

  /* Tiptap content styling */
  .tiptap-editor :global(.tiptap-content) {
    padding: 16px 20px;
    min-height: 350px;
    outline: none;
    font-family: "Source Serif 4", "Iowan Old Style", Georgia, serif;
    font-size: 1.05rem;
    line-height: 1.75;
    color: oklch(0.92 0.005 270);
  }

  .tiptap-editor :global(.tiptap-content p) {
    margin: 0 0 1em;
  }

  .tiptap-editor :global(.tiptap-content h2) {
    font-family: "Sora", "Inter", sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 1.5em 0 0.6em;
    letter-spacing: -0.02em;
    color: oklch(0.97 0.005 270);
  }

  .tiptap-editor :global(.tiptap-content h3) {
    font-family: "Sora", "Inter", sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 1.3em 0 0.5em;
    letter-spacing: -0.02em;
    color: oklch(0.95 0.005 270);
  }

  .tiptap-editor :global(.tiptap-content h4) {
    font-family: "Sora", "Inter", sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 1.2em 0 0.4em;
    color: oklch(0.90 0.005 270);
  }

  .tiptap-editor :global(.tiptap-content strong) {
    font-weight: 700;
    color: oklch(0.97 0.005 270);
  }

  .tiptap-editor :global(.tiptap-content em) {
    font-style: italic;
  }

  .tiptap-editor :global(.tiptap-content u) {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .tiptap-editor :global(.tiptap-content s) {
    text-decoration: line-through;
    opacity: 0.7;
  }

  .tiptap-editor :global(.tiptap-content blockquote) {
    border-left: 3px solid oklch(0.58 0.23 25 / 0.6);
    padding-left: 16px;
    margin: 1em 0;
    color: oklch(0.78 0.02 270);
    font-style: italic;
  }

  .tiptap-editor :global(.tiptap-content ul) {
    list-style-type: disc;
    padding-left: 1.5em;
    margin: 0.8em 0;
  }

  .tiptap-editor :global(.tiptap-content ol) {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin: 0.8em 0;
  }

  .tiptap-editor :global(.tiptap-content li) {
    margin: 0.3em 0;
  }

  .tiptap-editor :global(.tiptap-content pre) {
    background: oklch(0.14 0.02 270);
    border: 1px solid oklch(0.28 0.025 270 / 0.5);
    border-radius: 8px;
    padding: 14px 18px;
    margin: 1em 0;
    overflow-x: auto;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .tiptap-editor :global(.tiptap-content code) {
    background: oklch(0.22 0.025 270);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 0.88em;
  }

  .tiptap-editor :global(.tiptap-content pre code) {
    background: none;
    padding: 0;
    border-radius: 0;
  }

  .tiptap-editor :global(.tiptap-content hr) {
    border: none;
    border-top: 1px solid oklch(0.30 0.025 270 / 0.5);
    margin: 1.5em 0;
  }

  /* Placeholder styling */
  .tiptap-editor :global(.tiptap-content p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    color: oklch(0.45 0.02 270);
    pointer-events: none;
    height: 0;
    font-style: italic;
  }

  /* Scrollbar inside editor */
  .tiptap-editor::-webkit-scrollbar { width: 8px; }
  .tiptap-editor::-webkit-scrollbar-track { background: transparent; }
  .tiptap-editor::-webkit-scrollbar-thumb {
    background: oklch(0.30 0.03 270 / 0.5);
    border-radius: 999px;
  }
  .tiptap-editor::-webkit-scrollbar-thumb:hover {
    background: oklch(0.58 0.23 25);
  }
</style>
