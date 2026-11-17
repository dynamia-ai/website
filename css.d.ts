// Next only ships types for `*.module.css`; plain CSS side-effect imports need this.
// Must stay in a script .d.ts (no import/export) — ambient modules inside
// `global.d.ts` don't apply because that file is itself a module.
declare module '*.css';
