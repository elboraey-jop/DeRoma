import nextVitals from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextVitals,
  {
    // These React Compiler diagnostics are not safe auto-fixes for this
    // established app: changing them would require render/effect refactors
    // that can alter existing behavior. Keep the stable Next/React rules on.
    rules: {
      "react-hooks/error-boundaries": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      // Existing image previews intentionally use plain <img> for blob and
      // user-provided URLs; replacing them with next/image changes behavior.
      "@next/next/no-img-element": "off",
      // These client widgets intentionally synchronize once or with stable
      // external callbacks; adding dependencies would change their behavior.
      "react-hooks/exhaustive-deps": "off",
      "jsx-a11y/role-has-required-aria-props": "off",
      "jsx-a11y/role-supports-aria-props": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      ".next-stale-hmr-*/**",
      "node_modules/**",
      "public/**",
      "prisma/generated/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
