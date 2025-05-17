import { FormattableString, Plugin } from "gramio";
import { splitText } from "./spliters.ts";
import { type MaybePromise, TEXT_LIMIT } from "./utils.ts";

type Action<ReturnData = unknown> = (
	formattableString: FormattableString,
) => MaybePromise<ReturnData>;

export async function splitMessage<ReturnData>(
	text: FormattableString | string,
	action: Action<ReturnData>,
	limit: number = TEXT_LIMIT,
): Promise<ReturnData[]> {
	const splittedParts = splitText(
		text.toString(),
		typeof text === "string" ? undefined : text.entities,
		"symbol",
		limit,
	);

	const responses: ReturnData[] = [];

	for (const part of splittedParts) {
		const formattableString = new FormattableString(
			part.text,
			part.entities ?? [],
		);

		const response = await action(formattableString);
		responses.push(response);
	}

	return responses;
}

// export function splitPlugin() {
// 	return new Plugin("@gramio/split").preRequest(
// 		"sendMessage",
// 		async (context) => {
// 			console.log(context.params.text);

// 			return context;
// 		},
// 	);
// }
