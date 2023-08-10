import { createEffect, createMemo, createSignal } from "@solid-cli/reactivity";
import { SL, SupportedLanguages, TemplateFunction, Translations } from "./types";
import { on } from "@solid-cli/reactivity";
import { log } from "@clack/prompts";
import { config, setConfig } from "../config";
export const [locale, setLocale] = createSignal<SL | null>(null);
export const validatedLocale = createMemo(() => {
	const l = locale();
	if (!l) return "en";
	const supported = !!SupportedLanguages.find((lang) => lang.toLowerCase() === l.toLowerCase());
	if (!supported) {
		log.warn(`Unsupported language: ${l}. Defaulting to English.`);
	}
	return supported ? l : "en";
});
createEffect(
	on(
		validatedLocale,
		(l) => {
			setConfig({ ...config(), lang: l });
		},
		{ defer: true },
	),
);
const TRANSLATIONS = {
	AUTOCOMPLETE_SELECTED: {
		en: "Selected Packages",
		es: "Paquetes seleccionados",
		fr: "Forfaits sélectionnés",
		ja: "選択されたパッケージ",
	},
	AUTOCOMPLETE_NO_RESULTS: {
		en: "No results",
		es: "No hay resultados",
		fr: "Aucun résultat",
		ja: "結果がありません",
	},
	SELECT_START_ACTION: {
		en: "Select a start action",
		es: "Seleccione una acción de inicio",
		fr: "Sélectionnez une action de démarrage",
		ja: "開始アクションを選択してください",
	},
	SELECT_ACTION: {
		en: "Select an action",
		es: "Seleccione una acción",
		fr: "Sélectionnez une action",
		ja: "アクションを選択してください",
	},
	ACTION_ADD: {
		en: "Add an integration",
		es: "Añadir una integración",
		fr: "Ajouter une intégration",
		ja: "統合を追加する",
	},
	ACTION_NEW: {
		en: "Create new project",
		es: "Crear nuevo proyecto",
		fr: "Créer un nouveau projet",
		ja: "新しいプロジェクトを作成する",
	},
	ACTION_START: {
		en: "A start specific action",
		es: "Una acción específica de inicio",
		fr: "Une action spécifique de démarrage",
		ja: "特定のアクションを開始する",
	},
	NEW_VARIATION_DESC: {
		en: "The variation to create, for example `bare`",
		es: "La variación a crear, por ejemplo `bare`",
		fr: "La variante à créer, par exemple `bare`",
		ja: "作成するバリエーション、たとえば「bare」",
	},
	NEW_NAME_DESC: {
		en: "The name of the folder to create",
		es: "El nombre de la carpeta a crear.",
		fr: "Le nom du dossier à créer",
		ja: "作成するフォルダーの名前",
	},
	IS_START_PROJECT: {
		en: "Is this a Solid-Start project?",
		es: "¿Es este un proyecto de Solid-Start?",
		fr: "Est-ce un projet Solid-Start ?",
		ja: "これはソリッドスタートプロジェクトですか?",
	},
	START_MODE: {
		en: "Mode",
		es: "Modo",
		fr: "Mode",
		ja: "モード",
	},
	START_MODE_HINT: {
		en: "Changes the mode of the solid app (SSR, CSR, SSG)",
		es: "Cambia el modo de la aplicación sólida (SSR, CSR, SSG)",
		fr: "Modifie le mode de l'application solide (SSR, CSR, SSG)",
		ja: "ソリッドアプリのモードを変更します（SSR、CSR、SSG）",
	},
	START_MODE_DESC: {
		en: "The rendering mode for solid to build for, and use.",
		es: "El modo de renderizado de solid para construir y usar.",
		fr: "Le mode de rendu du solid pour lequel construire et utiliser.",
		ja: "solid がビルドして使用するレンダリング モード。",
	},
	START_ROUTE: {
		en: "Route",
		es: "Ruta",
		fr: "Itinéraire",
		ja: "ルート",
	},
	START_ROUTE_HINT: {
		en: "Allows you to create a new file system route",
		es: "Le permite crear una nueva ruta de sistema de archivos",
		fr: "Vous permet de créer une nouvelle route de système de fichiers",
		ja: "新しいファイル システム ルートを作成できます。",
	},
	START_ROUTE_DESC: {
		en: "The name of `.tsx` file to be generated",
		es: "El nombre del archivo `.tsx` que se generará",
		fr: "Le nom du fichier `.tsx` à générer",
		ja: "生成される `.tsx` ファイルの名前",
	},
	START_DATA: {
		en: "Data File",
		es: "Archivo de datos",
		fr: "Fichier de données",
		ja: "データファイル",
	},
	START_DATA_HINT: {
		en: "Allows you to create a new data file within a route",
		es: "Le permite crear un nuevo archivo de datos dentro de una ruta",
		fr: "Permet de créer un nouveau fichier de données au sein d'un itinéraire",
		ja: "ルート内に新しいデータ ファイルを作成できます。",
	},
	START_DATA_DESC: {
		en: "The name of the `.data.ts` file to be generated.",
		es: "El nombre del archivo `.data.ts` que se generará.",
		fr: "Le nom du fichier `.data.ts` à générer.",
		ja: "生成される `.data.ts` ファイルの名前。",
	},
	START_ADAPTER: {
		en: "Adapter",
		es: "Adaptador",
		fr: "Adaptateur",
		ja: "アダプタ",
	},
	START_ADAPTER_HINT: {
		en: "Allows for setting and updating the adapter used to build a start app",
		es: "Permite configurar y actualizar el adaptador utilizado para crear una aplicación de inicio",
		fr: "Permet de définir et de mettre à jour l'adaptateur utilisé pour créer une application de démarrage",
		ja: "スタートアプリの構築に使用されるアダプターの設定と更新が可能",
	},
	START_ADAPTER_DISPLAYNAME: {
		en: "Adapter name",
		es: "Nombre del adaptador",
		fr: "Nom de l'adaptateur",
		ja: "アダプター名",
	},
	START_API: {
		en: "API",
		es: "API",
		fr: "API",
		ja: "API",
	},
	START_API_HINT: {
		en: "Create an API route",
		es: "Crear una ruta API",
		fr: "Créer une route d'API",
		ja: "APIルートを作成する",
	},
	START_API_DISPLAYNAME: {
		en: "API file name",
		es: "Nombre de archivo API",
		fr: "Nom du fichier API",
		ja: "APIファイル名",
	},
	CANCELED: {
		en: "Canceled",
		es: "Cancelado",
		fr: "Annulé",
		ja: "キャンセル",
	},
	CONFIRM_INSTALL: (n: number) => ({
		en: `Install the following (${n}) packages?`,
		es: `Instale lo siguiente (${n}) paquetes?`,
		fr: `Installez les éléments suivants (${n}) paquets?`,
		ja: `以下をインストールします (${n}) パッケージ？`,
	}),
	NEW_START: {
		en: "Which template would you like to use?",
		es: "¿Qué plantilla te gustaría usar?",
		fr: "Quel modèle souhaitez-vous utiliser ?",
		ja: "どのテンプレートを使いたいですか?",
	},
	ADD_DESC: {
		en: "Can add and install integrations: `solid add unocss`.",
		es: "Puede agregar e instalar integraciones: `solid add unocss`.",
		fr: "Peut ajouter et installer des intégrations : `solid add unocss`.",
		ja: "統合を追加およびインストールできます: `solid add unocss`。",
	},
	NEW_DESC: {
		en: "Creates a new solid project",
		es: "Crea un nuevo proyecto sólido.",
		fr: "Crée un nouveau projet solide",
		ja: "新しいソリッドプロジェクトを作成します",
	},
	ADD_PACKAGES: {
		en: "Add packages",
		es: "Agregar paquetes",
		fr: "Ajouter des forfaits",
		ja: "パッケージの追加",
	},
	NOTHING_SELECTED: {
		en: "Nothing selected",
		es: "Nada seleccionado",
		fr: "Rien de sélectionné",
		ja: "何も選択されていません",
	},
	YES: {
		en: "Yes",
		es: "Sí",
		fr: "Oui",
		ja: "はい",
	},
	NO: {
		en: "No",
		es: "No",
		fr: "Non",
		ja: "いいえ",
	},
	YES_FORCE: {
		en: "Yes (force)",
		es: "Sí (fuerza)",
		fr: "Oui (forcer)",
		ja: "はい（強制）",
	},
	PROJECT_CREATED: {
		en: "Project successfully created! 🎉",
		es: "¡Proyecto creado con éxito! 🎉",
		fr: "Projet créé avec succès! 🎉",
		ja: "プロジェクトが正常に作成されました。 🎉",
	},
	CREATING_PROJECT: {
		en: "Creating project",
		es: "Creando proyecto",
		fr: "Création de projet",
		ja: "プロジェクトの作成",
	},
	TEMPLATE: {
		en: "Template",
		es: "Plantilla",
		fr: "Modèle",
		ja: "レンプレート",
	},
	GET_STARTED: {
		en: "To get started, run:",
		es: "Para empezar, ejecuta:",
		fr: "Pour commencer, exécutez :",
		ja: "開始するには、次を実行します。",
	},
	PROJECT_NAME: {
		en: "Project Name",
		es: "Nombre del proyecto",
		fr: "nom du projet",
		ja: "プロジェクト名",
	},
	LOADING_PRIMITIVES: {
		en: "Loading primitives",
		es: "Cargando primitivas",
		fr: "Chargement des primitives",
		ja: "プリミティブのロード",
	},
	PRIMITIVES_LOADED: {
		en: "Primitives loaded",
		es: "Primitivos cargados",
		fr: "Primitives chargées",
		ja: "プリミティブがロードされました",
	},
	INSTALLING_VIA: (pm: string) => ({
		en: `Installing packages via ${pm}`,
		es: `Instalación de paquetes a través de ${pm}`,
		fr: `Installation de packages via ${pm}`,
		ja: `経由でパッケージをインストールする ${pm}`,
	}),
	CONFIG_UPDATED: {
		en: "Config updated",
		es: "Configuración actualizada",
		fr: "Configuration mise à jour",
		ja: "構成が更新されました",
	},
	PACKAGES_INSTALLED: {
		en: "Packages installed",
		es: "Paquetes instalados",
		fr: "Paquets installés",
		ja: "インストールされたパッケージ",
	},
	POST_INSTALL: {
		en: "Running post install steps",
		es: "Ejecución de pasos posteriores a la instalación",
		fr: "Exécution des étapes de post-installation",
		ja: "インストール後の手順の実行",
	},
	POST_INSTALL_COMPLETE: {
		en: "Post install complete",
		es: "Post instalación completa",
		fr: "Post-installation terminée",
		ja: "インストール後の完了",
	},
	NO_SUPPORT: (n: string) => ({
		en: `Can't automatically configure ${n}: we don't support it.`,
		es: `No se puede configurar automáticamente ${n}: no lo admitimos`,
		fr: `Impossible de configurer automatiquement ${n}: nous ne le prenons pas en charge`,
		ja: `${n} を自動的に構成できません: サポートされていません`,
	}),
	OPENING_IN_BROWSER: (s: string) => ({
		en: `Opening ${s} in browser`,
		es: `Abriendo ${s} en el navegador`,
		fr: `Ouverture de ${s} dans le navigateur`,
		ja: `ブラウザで ${s} を開く`,
	}),
	OPENED_IN_BROWSER: {
		en: "Successfully Opened in Browser",
		es: "Abierto con éxito en el navegador",
		fr: "Ouvert avec succès dans le navigateur",
		ja: "ブラウザで正常に開きました",
	},
} as const satisfies Translations;

export const t = new Proxy(TRANSLATIONS, {
	get(target, p, _receiver) {
		const l = validatedLocale() as SL;
		let text = target[p as keyof typeof target];

		if (typeof text === "function") {
			return new Proxy(text, {
				apply(target, thisArg, argArray) {
					const newT = Reflect.apply(target, thisArg, argArray);
					if (l in newT) {
						return newT[l];
					}
					return newT["en"];
				},
			});
		}

		if (l in text) {
			return text[l as keyof typeof text];
		}
		return text["en"];
	},
}) as unknown as {
	[k in keyof typeof TRANSLATIONS]: (typeof TRANSLATIONS)[k] extends TemplateFunction
		? (...args: Parameters<(typeof TRANSLATIONS)[k]>) => string
		: string;
};
