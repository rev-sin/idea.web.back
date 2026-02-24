module.exports = {
	"*.{js,jsx,mjs,ts,tsx,mts,mdx}": [
		"biome lint --write",
		"biome check --write",
		"biome format --write",
	],
};
