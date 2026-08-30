declare module "gray-matter" {
  interface GrayMatterResult<T = Record<string, unknown>> {
    data: T;
    content: string;
    excerpt: string;
    isEmpty: boolean;
    language: string;
    matter: string;
    orig: Buffer | string;
    stringify(lang?: string): string;
  }
  function matter<T = Record<string, unknown>>(
    input: string | Buffer,
    options?: Record<string, unknown>
  ): GrayMatterResult<T>;
  export = matter;
}
