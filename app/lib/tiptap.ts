import { generateHTML } from "@tiptap/html";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { Mention } from "@tiptap/extension-mention";
import { Image } from "@tiptap/extension-image";

export function generateHTMLFromTipTap(document: unknown): string {
  return generateHTML(document, [
    Image.extend({ renderText: () => "[image]" }),
    Mention.extend({
      name: "mention",
      HTMLAttributes: { class: "bg-border" },
    }),
    Mention.extend({
      name: "contract-mention",
      HTMLAttributes: { class: "bg-border" },
    }),
    StarterKit,
    Link,
  ]);
}
