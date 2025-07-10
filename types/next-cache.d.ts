declare module "next/cache" {
  export function revalidateTag(tag: string): void;
  export function revalidatePath(path: string, type?: "page" | "layout"): void;
}
