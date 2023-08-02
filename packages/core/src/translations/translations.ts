import { createSignal } from "@solid-cli/reactivity";
import { SL, Translations } from "./types";
export const [locale, setLocale] = createSignal(Intl.DateTimeFormat().resolvedOptions().locale);

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
  CANCELED: {
    en: "Canceled",
    es: "Cancelado",
    fr: "Annulé",
    ja: "キャンセル",
  },
  CONFIRM_INSTALL: {
    en: "Install the following",
    es: "Instale lo siguiente",
    fr: "Installez les éléments suivants",
    ja: "以下をインストールします",
  },
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
} as const satisfies Translations;

export const t = new Proxy(TRANSLATIONS, {
  get(target, p, receiver) {
    const l = locale() as SL;
    const text = target[p as keyof typeof target];
    if (l in text) {
      return text[l as keyof typeof text];
    }
    return text["en"];
  },
}) as unknown as Record<keyof typeof TRANSLATIONS, string>;
