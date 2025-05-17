# @gramio/split

[![npm](https://img.shields.io/npm/v/@gramio/split?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/@gramio/split)
[![npm downloads](https://img.shields.io/npm/dw/@gramio/split?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/@gramio/split)
[![JSR](https://jsr.io/badges/@gramio/split)](https://jsr.io/@gramio/split)
[![JSR Score](https://jsr.io/badges/@gramio/split/score)](https://jsr.io/@gramio/split)

This plugin can split messages which reach the Telegram limit into multiple parts (messages). This plugin also split entities so you don't need to do it manually.

# Usage

```ts
import { splitMessage } from "@gramio/split";

const bot = new Bot(process.env.BOT_TOKEN!).command(
    "start",
    async (context) => {
        const messages = await splitMessage(
            format`${bold("foo".repeat(4096 * 2))}`,
            context.send.bind(context) // .bind(context) is required because otherwise it will lose context data
        );

        console.log(messages); // messages is array of second argument results
    }
);

await bot.start();
```

You can also use it in other frameworks.

```ts
import { splitMessage } from "@gramio/split";

const messages = await splitMessage(
    format`${bold("foo".repeat(4096 * 2))}`,
    ({ text, entities }) => {
        return someOtherFramework.sendMessage(text, { entities });
    }
);
```

> [!NOTE]
> This package mostly in the WIP stage.

## TODO:

-   [ ] More tests
-   [ ] Plugin with auto-split
-   [ ] Split mode by entities
-   [ ] Auto split action strategies (like `sendPhoto` caption next splits to `sendMessage` text)
