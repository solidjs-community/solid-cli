import { ASTNode, ProxifiedModule, generateCode } from "magicast";
import { PluginOptions } from ".";

type ASTNodeFull = ASTNode & {
	key?: ASTNodeFull;
	value?: ASTNodeFull;
	name?: string;
	body?: ASTNodeFull[] | ASTNodeFull;
};

type ArrayExpression = Extract<ASTNode, { type: "ArrayExpression" }>;

const isNodeFunction = (node: ASTNodeFull) => node.type === "BlockStatement" || node.type === "ArrowFunctionExpression";

const getReturnStatement = (node: ASTNodeFull | undefined) => {
	if (!node) return;
	if (node.type === "BlockStatement" && node.body) {
		let returnStatement;

		for (const leaf of node.body) {
			if (leaf.type === "ReturnStatement") {
				returnStatement = leaf;
				break;
			}
		}

		return returnStatement;
	}
};

const findOrCreatePluginsProperty = (node: ASTNodeFull) => {
	if (node.type === "ObjectExpression" && node.properties) {
		for (const leaf of node.properties) {
			if (
				leaf.type === "ObjectProperty" &&
				leaf.key.loc?.identifierName === "plugins" &&
				leaf.value.type === "ArrayExpression"
			) {
				return leaf.value;
			}
		}

		const value: ArrayExpression = {
			type: "ArrayExpression",
			elements: [],
		};

		node.properties.push({
			type: "ObjectProperty",
			key: {
				type: "Identifier",
				name: "plugins",
			},
			computed: false,
			shorthand: false,
			value,
		});

		return value;
	}
};

const findPlugins = (mod: ProxifiedModule<any>): ArrayExpression | undefined => {
	const props: ASTNodeFull[] = mod.exports.default.$args[0].$ast.properties;

	let viteFound = false;
	for (const prop of props) {
		const key = prop.key?.name;
		if (key === "vite") {
			const isProperty = prop.type === "ObjectProperty";
			const isMethod = prop.type === "ObjectMethod";

			if (isMethod || (isProperty && isNodeFunction(prop.value))) {
				const returnValue = getReturnStatement(
					isProperty && prop.value.type === "ArrowFunctionExpression" && prop.value.body.type === "BlockStatement"
						? prop.value.body
						: isMethod && prop.body.body
							? prop.body
							: undefined,
				);

				if (!returnValue) break;

				const arg = returnValue.argument;
				if (arg?.type === "ObjectExpression") {
					return findOrCreatePluginsProperty(arg);
				}
			} else if (isProperty && prop.value.type === "ObjectExpression") {
				return findOrCreatePluginsProperty(prop.value);
			}

			viteFound = true;

			break;
		}
	}

	if (!viteFound) {
		props.push({
			type: "ObjectProperty",
			computed: false,
			shorthand: false,
			value: { type: "ObjectExpression", properties: [] },
			key: { name: "vite", type: "Identifier" },
		});
		return findPlugins(mod);
	}
};

export const addPlugins = (mod: ProxifiedModule<any>, plugins: PluginOptions[]) => {
	// const mod = parseModule(config.contents, { trailingComma: false, flowObjectCommas: false });

	const current = findPlugins(mod);

	for (const plugin of plugins) {
		mod.imports.$add({
			from: plugin.importSource,
			imported: plugin.isDefault ? "default" : plugin.importName,
			local: plugin.importName,
		});
		current?.elements.push(`${plugin.importName}({})` as any);
	}

	return generateCode(mod);
};
