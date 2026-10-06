import { describe, expect, it } from "vitest";
import { formatNumberFor, interpolate, toBengaliDigits } from "@/shared/i18n/format";
import { dictionaries } from "./dictionary";

describe("dictionaries", () => {
  it("define the same keys in every language, all non-empty", () => {
    const englishKeys = Object.keys(dictionaries.en).sort();
    expect(Object.keys(dictionaries.bn).sort()).toEqual(englishKeys);
    for (const language of ["en", "bn"] as const) {
      for (const [key, value] of Object.entries(dictionaries[language])) {
        expect(value.trim(), `${language}:${key}`).not.toBe("");
      }
    }
  });

  it("only use Bengali placeholders that the English message also receives", () => {
    // Call sites pass these params even though the English wording doesn't print them.
    const bengaliOnlyPlaceholders: Partial<Record<keyof typeof dictionaries.en, string[]>> = {
      "catalogue.hero.searchLine1": ["{query}"],
      "brand.perk.nationwide.label": ["{districts}"]
    };
    const placeholders = (text: string) => new Set(text.match(/\{\w+\}/g) ?? []);

    for (const key of Object.keys(dictionaries.en) as (keyof typeof dictionaries.en)[]) {
      const allowed = new Set([...placeholders(dictionaries.en[key]), ...(bengaliOnlyPlaceholders[key] ?? [])]);
      const unexpected = [...placeholders(dictionaries.bn[key])].filter((name) => !allowed.has(name));
      expect(unexpected, key).toEqual([]);
    }
  });
});

describe("formatting", () => {
  it("converts digits for Bengali only", () => {
    expect(toBengaliDigits("৳1,290")).toBe("৳১,২৯০");
    expect(formatNumberFor("en", 64)).toBe("64");
    expect(formatNumberFor("bn", 64)).toBe("৬৪");
  });

  it("interpolates numbers in the language's digits and strings verbatim", () => {
    expect(interpolate("{count} items for {query}", "bn", { count: 12, query: "Bottle 8ml" })).toBe("১২ items for Bottle 8ml");
    expect(interpolate("Hello {name}", "en")).toBe("Hello {name}");
    expect(interpolate("Hello {missing}", "en", {})).toBe("Hello {missing}");
  });
});
