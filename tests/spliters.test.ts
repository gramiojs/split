import { describe, expect, test } from "bun:test";
import type { TelegramMessageEntity } from "@gramio/types";
import { splitText } from "../src/spliters.ts";
import { TEXT_LIMIT } from "../src/utils.ts";

const testCases = [
	{
		description: "should split at exact limit in symbol mode",
		input: {
			text: "a".repeat(TEXT_LIMIT + 100),
			entities: [
				{
					type: "bold",
					offset: 0,
					length: TEXT_LIMIT + 100,
				} satisfies TelegramMessageEntity,
			],
			mode: "symbol" as const,
		},
		expected: [
			{
				text: "a".repeat(TEXT_LIMIT),
				entities: [
					{
						type: "bold",
						offset: 0,
						length: TEXT_LIMIT,
					},
				],
			},
			{
				text: "a".repeat(100),
				entities: [
					{
						type: "bold",
						offset: 0,
						length: 100,
					},
				],
			},
		],
	},
	{
		description: "should split at entity boundary in entity mode",
		input: {
			text: "foo".repeat(TEXT_LIMIT * 2),
			entities: [
				{
					type: "bold",
					offset: 0,
					length: TEXT_LIMIT - 200,
				} satisfies TelegramMessageEntity,
				{
					type: "italic",
					offset: TEXT_LIMIT + 120,
					length: 500,
				} satisfies TelegramMessageEntity,
			],
			mode: "entity" as const,
		},
		expected: [
			{
				text: "foo".repeat(TEXT_LIMIT - 200), // 666*3=1998
				entities: [{ type: "bold", offset: 0, length: TEXT_LIMIT - 200 }],
			},
			{
				text:
					"foo".repeat(TEXT_LIMIT - 200) +
					"foo".repeat(TEXT_LIMIT * 2 - (TEXT_LIMIT - 200)),
				entities: [
					{ type: "bold", offset: 0, length: TEXT_LIMIT - 200 },
					{ type: "italic", offset: 502, length: 500 },
				],
			},
		],
	},
	{
		description: "should handle empty entities array",
		input: {
			text: "a".repeat(TEXT_LIMIT * 2),
			entities: [],
			mode: "symbol" as const,
		},
		expected: [
			{ text: "a".repeat(TEXT_LIMIT), entities: undefined },
			{ text: "a".repeat(TEXT_LIMIT), entities: undefined },
		],
	},
];

describe.each(testCases)("splitText", ({ description, input, expected }) => {
	test(description, () => {
		const result = splitText(input.text, input.entities, input.mode);
		console.log(Bun.inspect(result));

		expect(result).toHaveLength(expected.length);

		result.forEach((part, index) => {
			expect(part.text).toBe(expected[index].text);

			if (expected[index].entities) {
				expect(part.entities).toBeArray();
				expect(part.entities).toEqual(expected[index].entities);
			} else {
				expect(part.entities).toBeEmpty();
			}
		});
	});
});

test("should handle overlapping entities", () => {
	const entities: TelegramMessageEntity[] = [
		{ type: "bold", offset: 0, length: 100 },
		{ type: "italic", offset: 50, length: 150 },
	];

	const result = splitText("a".repeat(300), entities, "symbol", 150);

	expect(result).toHaveLength(2);
	expect(result[0].entities).toEqual([
		{ type: "bold", offset: 0, length: 100 },
		{ type: "italic", offset: 50, length: 100 },
	]);
	expect(result[1].entities).toEqual([
		{ type: "italic", offset: 0, length: 50 },
	]);
});
