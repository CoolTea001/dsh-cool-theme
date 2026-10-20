/**
 * Style injection helper: prefers DSH `styles.insert`, falls back to raw DOM.
 */
export declare function createStyleInjector(): {
    insert: (css: string) => () => void;
    disposeAll: () => void;
};
//# sourceMappingURL=style-injector.d.ts.map