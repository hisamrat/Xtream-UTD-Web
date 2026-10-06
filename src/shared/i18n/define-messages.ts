/**
 * Declares one message namespace. The English object defines the keys; the Bengali
 * object must provide exactly the same keys (enforced by the type system).
 */
export function defineMessages<const Keys extends string>(messages: {
  en: Record<Keys, string>;
  bn: Record<Keys, string>;
}): { en: Record<Keys, string>; bn: Record<Keys, string> } {
  return messages;
}
