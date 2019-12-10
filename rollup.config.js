import acornClassFields from 'acorn-class-fields';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import executable from "rollup-plugin-executable";
import native from "rollup-plugin-native";
import json from "@rollup/plugin-json";
import cleanup from "rollup-plugin-cleanup";
import builtins from "builtin-modules";
import pkg from "./package.json";

const external = [...builtins,
  "dbus-next",
  "koa"
];
const extensions = ["js", "mjs", "jsx", "tag"];
const plugins = [
  commonjs(),
  resolve(),
  native(),
  json({
    preferConst: true,
    compact: true
  }),
  cleanup({
    extensions
  })
];

const config = Object.keys(pkg.bin || {}).map(name => {
  return {
    input: `src/${name}-cli.mjs`,
    output: {
      plugins: [executable()],
      file: pkg.bin[name]
    }
  };
});

if (pkg.module !== undefined && pkg.main !== undefined && pkg.module != pkg.main) {
  config.push({
    input: pkg.module,
    output: {
      file: pkg.main
    }
  });
}

export default config.map(c => {
  c.output = {
    interop: false,
    externalLiveBindings: false,
    format: "cjs",
    ...c.output
  };
  return { plugins, external, ...c };
});
