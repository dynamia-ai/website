export interface LocaleCatalog {
  translations: Array<[string,string]>;
  assets: Record<string,string>;
  animationAssets?: Record<string,string>;
  about: {first:string;second:string};
  languageLabel:string;
}
export function makeLocalizer(catalog:LocaleCatalog|undefined, document:Document): {translate:(text:string)=>string;markup:(html:string)=>string};
