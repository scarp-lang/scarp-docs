/**
 * VitePress loads CSS through Vite; TypeScript's strict side-effect import
 * check needs an ambient asset module to recognize these imports.
 * This declaration does not disable checking of TS or Vue source files.
 */
declare module '*.css'
