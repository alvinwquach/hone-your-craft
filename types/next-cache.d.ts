declare module "next/cache" {
  export function revalidateTag(tag: string): void;
  export function revalidatePath(path: string, type?: "page" | "layout"): void;

  export function unstable_cache<T extends (...args: any[]) => any>(
    fn: T,
    keyParts?: string[],
    options?: {
      revalidate?: number | false;
      tags?: string[];
    }
  ): T;
}
