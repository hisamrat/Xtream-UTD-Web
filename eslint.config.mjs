import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Layer boundaries (see docs/ARCHITECTURE-ANALYSIS.md §18):
 *   app → features | server | domain | shared | i18n | config | content
 *   features → domain | shared | i18n | config | content (never server)
 *   server → domain | shared | config
 *   domain → config only (pure, no React/Next/I/O)
 *   shared → nothing app-specific
 */
const restrict = (patterns) => ["error", { patterns }];

const noServer = { group: ["@/server/*", "**/server/**"], message: "Server-only code may only be imported by app/ routes." };
const noFeatures = { group: ["@/features/*"], message: "Features are composed by app/ routes, not imported here." };
const noI18n = { group: ["@/i18n/*"], message: "This layer must not depend on UI translations." };
const noApp = { group: ["@/app/*", "**/app/**"], message: "Nothing imports from app/." };
const noBundledData = {
  group: ["**/design-reference/**"],
  message: "Only src/server/catalog/sources/local-json.ts may read the bundled catalogue."
};

export default [
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "dist/**", "test-artifacts/**", "next-env.d.ts"]
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // eslint-plugin-react's version auto-detection is incompatible with ESLint 10.
    settings: { react: { version: "19.2" } },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]
    }
  },
  {
    files: ["src/features/**", "src/i18n/**"],
    rules: { "no-restricted-imports": restrict([noServer, noApp, noBundledData]) }
  },
  {
    files: ["src/server/**"],
    ignores: ["src/server/catalog/sources/local-json.ts"],
    rules: { "no-restricted-imports": restrict([noFeatures, noI18n, noApp, noBundledData]) }
  },
  {
    files: ["src/domain/**"],
    rules: {
      "no-restricted-imports": restrict([
        noServer,
        noFeatures,
        noI18n,
        noApp,
        noBundledData,
        { group: ["react", "react-dom", "next", "next/*", "@/shared/*", "node:*"], message: "Domain code must stay pure." }
      ])
    }
  },
  {
    files: ["src/shared/**", "src/config/**", "src/content/**"],
    rules: {
      "no-restricted-imports": restrict([
        noServer,
        noFeatures,
        noI18n,
        noApp,
        noBundledData,
        { group: ["@/domain/*"], message: "Shared/config/content code must not depend on domain modules." }
      ])
    }
  }
];
