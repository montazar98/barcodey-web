declare module 'negotiator' {
  export default class Negotiator {
    constructor(options: { headers: { [key: string]: string | undefined } });
    languages(): string[];
    languages(availableLanguages: string[]): string[];
    mediaTypes(): string[];
    mediaTypes(availableMediaTypes: string[]): string[];
    charsets(): string[];
    charsets(availableCharsets: string[]): string[];
    encodings(): string[];
    encodings(availableEncodings: string[]): string[];
  }
}
