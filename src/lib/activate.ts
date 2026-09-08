/**
 * 一覧行とステッカーの相互ハイライトが、どちらの操作で発火したか。
 * ホバーとフォーカスを別系統にしないと、片方が離れたときにもう片方由来の
 * ハイライトまで消えてしまう（AppLibrarySection が状態を持つ）。
 */
export type ActivateSource = "hover" | "focus";
