const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: {
    // .ts do projeto e alguns .js de node_modules que só existem em formato ESM.
    "^.+\.[tj]s$": ["ts-jest", { tsconfig: { allowJs: true }, diagnostics: { ignoreCodes: ["TS151001"] } }],
  },
  // Pacotes ESM-only (ex.: content-disposition, usado pelo @fastify/static) precisam ser transpilados.
  transformIgnorePatterns: ["node_modules/(?!(content-disposition)/)"],
  // O apelido "@/..." vem direto do "paths" do tsconfig.json: um lugar só para manter.
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  setupFiles: ["<rootDir>/tests/setup-env.ts"],
  globalSetup: "<rootDir>/tests/global-setup.ts",
  testTimeout: 20000,
};
