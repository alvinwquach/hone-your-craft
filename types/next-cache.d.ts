declare module "next/cache" {
  export const revalidatePath: (path: string, type?: string) => void;
}
