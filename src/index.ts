import { Plugin } from "gramio";



export function splitPlugin() {
	return new Plugin("@gramio/split").preRequest(
		"sendMessage",
		async (context) => {
			console.log(context.params.text);

			return context;
		},
	);
}
