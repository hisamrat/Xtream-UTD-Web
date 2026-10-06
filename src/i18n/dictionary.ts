import type { Language } from "@/shared/i18n/languages";
import { brandMessages } from "./messages/brand";
import { cartMessages } from "./messages/cart";
import { catalogueMessages } from "./messages/catalogue";
import { commonMessages } from "./messages/common";
import { contactMessages } from "./messages/contact";
import { productMessages } from "./messages/product";
import { shellMessages } from "./messages/shell";
import { showcaseMessages } from "./messages/showcase";
import { systemMessages } from "./messages/system";

type Messages = Record<string, string>;
type Prefixed<Namespace extends string, M extends Messages> = {
  [Key in keyof M & string as `${Namespace}.${Key}`]: string;
};

function prefix<Namespace extends string, M extends Messages>(namespace: Namespace, messages: M): Prefixed<Namespace, M> {
  return Object.fromEntries(
    Object.entries(messages).map(([key, value]) => [`${namespace}.${key}`, value])
  ) as Prefixed<Namespace, M>;
}

function build(language: Language) {
  return {
    ...commonMessages[language],
    ...prefix("brand", brandMessages[language]),
    ...prefix("cart", cartMessages[language]),
    ...prefix("catalogue", catalogueMessages[language]),
    ...prefix("contact", contactMessages[language]),
    ...prefix("product", productMessages[language]),
    ...prefix("shell", shellMessages[language]),
    ...prefix("showcase", showcaseMessages[language]),
    ...prefix("system", systemMessages[language])
  };
}

const en = build("en");

/** Every UI message key, e.g. `"nav.home"` or `"catalogue.sort.newest"`. */
export type TranslationKey = keyof typeof en;

export const dictionaries: Record<Language, Record<TranslationKey, string>> = {
  en,
  bn: build("bn")
};
