import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [
    glsl({
      include: [
        "**/*.glsl",
        "**/*.wgsl",
        "**/*.vert",
        "**/*.frag",
        "**/*.vs",
        "**/*.fs",
      ],
      exclude: undefined,
      // Glob pattern, or array of glob patterns to ignore
      warnDuplicatedImports: true,
      // Warn if the same chunk was imported multiple times
      defaultExtension: "glsl",
      // Shader suffix when no extension is specified
      watch: true,
      // Recompile shader on change
      root: "/",
    }),
  ],
  // config options
});
