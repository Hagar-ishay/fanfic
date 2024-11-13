import { deleteFanfic } from "@/db/db";
import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";

export const action: ActionFunction = async ({
	request,
	params,
}: LoaderFunctionArgs) => {
	const ficId = params.sectionId;
	if (!ficId) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}

	switch (request.method) {
		case "DELETE": {
			return await deleteFanfic(+ficId);
		}
		default: {
			throw new Response("Method Not Allowed", { status: 405 });
		}
	}
};
