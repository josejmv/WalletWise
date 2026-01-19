module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Nueva funcionalidad
        "fix", // Corrección de bug
        "docs", // Documentación
        "style", // Formato (no afecta código)
        "refactor", // Refactorización
        "perf", // Mejora de rendimiento
        "test", // Tests
        "build", // Sistema de build
        "ci", // CI/CD
        "chore", // Tareas de mantenimiento
        "revert", // Revertir commit
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
  },
};
