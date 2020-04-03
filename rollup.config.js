import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export default {
	input: "src/index.ts",
	output: {
		dir: "lib",
		format: "commonjs",
	},
	external: ["vue", "rxjs", "rxjs/operators"],
	plugins: [typescript(), resolve(), commonjs()],
};
