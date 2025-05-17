import type { TelegramMessageEntity } from "@gramio/types";
import { TEXT_LIMIT } from "./utils.ts";

type SplitMode = "symbol"; //"entity" |
type SplitPart = { text: string; entities?: TelegramMessageEntity[] };

export function splitText(
	text: string,
	entities?: TelegramMessageEntity[],
	mode: SplitMode = "symbol",
	textLimit: number = TEXT_LIMIT,
): SplitPart[] {
	if (text.length <= textLimit) return [{ text, entities }];

	const splitIndex = textLimit;

	// if (mode === "entity" && entities?.length && text.length > textLimit) {
	// 	const relevantEntities = entities.filter((e) => e.offset < textLimit);
	// 	if (relevantEntities.length) {
	// 		const lastEntity = relevantEntities.reduce((prev, current) =>
	// 			prev.offset + prev.length > current.offset + current.length
	// 				? prev
	// 				: current,
	// 		);

	// 		splitIndex = Math.min(lastEntity.offset + lastEntity.length, textLimit);
	// 		console.log("lastEntity", lastEntity, splitIndex);
	// 	}
	// }

	const partText = text.slice(0, splitIndex);
	const remainingText = text.slice(splitIndex);

	const currentEntities =
		entities?.flatMap((e) => {
			if (e.offset >= splitIndex) return [];
			if (e.offset + e.length <= splitIndex) return [{ ...e }];

			return [
				{
					...e,
					length: splitIndex - e.offset,
				},
			];
		}) ?? [];

	const remainingEntities =
		entities?.flatMap((e) => {
			if (e.offset + e.length <= splitIndex) return [];
			const offset = Math.max(e.offset - splitIndex, 0);
			const length =
				e.offset < splitIndex ? e.length - (splitIndex - e.offset) : e.length;

			return length > 0 ? [{ ...e, offset, length }] : [];
		}) ?? [];

	return [
		{
			text: partText,
			entities: currentEntities.length ? currentEntities : undefined,
		},
		...splitText(remainingText, remainingEntities, mode, textLimit),
	];
}
