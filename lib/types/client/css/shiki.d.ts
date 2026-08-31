/**
 * Shiki token palette: values behind --shiki-* custom properties emitted by
 * ui-primitives CodeBlock. Light values on :root, dark overrides on
 * body[data-ds-dark-theme] — same cascade as every other token sheet.
 *
 * Background/foreground alias the markdown code-block tokens so highlighted
 * and plain blocks agree.
 * Dark selector covers both html and body for DSH compatibility.
 */
export declare const SHIKI_CSS = "\n:root {\n  --shiki-foreground: var(--dsw-alias-label-primary);\n  --shiki-background: var(--dsw-alias-markdown-code-block);\n  --shiki-token-constant: #1c7ed6;\n  --shiki-token-string: #2f9e44;\n  --shiki-token-comment: #868e96;\n  --shiki-token-keyword: #d6336c;\n  --shiki-token-parameter: #e8590c;\n  --shiki-token-function: #6741d9;\n  --shiki-token-string-expression: #2b8a3e;\n  --shiki-token-punctuation: #495057;\n  --shiki-token-link: #1971c2;\n}\n\nhtml[data-ds-dark-theme], body[data-ds-dark-theme] {\n  --shiki-token-constant: #4dabf7;\n  --shiki-token-string: #69db7c;\n  --shiki-token-comment: #adb5bd;\n  --shiki-token-keyword: #faa2c1;\n  --shiki-token-parameter: #ffa94d;\n  --shiki-token-function: #b197fc;\n  --shiki-token-string-expression: #8ce99a;\n  --shiki-token-punctuation: #ced4da;\n  --shiki-token-link: #74c0fc;\n}\n";
//# sourceMappingURL=shiki.d.ts.map