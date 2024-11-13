import { insertFanfic, selectFanfics } from "@/db/db"; // Assuming this is your DB function
import { type ActionFunction, json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "react-router-dom";

export async function loader({ params }: LoaderFunctionArgs) {
	const sectionId = params.sectionId;
	if (!sectionId) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	const fanfics = await selectFanfics(+sectionId);
	return json({ fanfics });
}

export const action: ActionFunction = async ({
	params,
	request,
}: LoaderFunctionArgs) => {
	const sectionId = params.sectionId;
	if (!sectionId) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	switch (request.method) {
		case "POST": {
			const formData = await request.formData();
			const fanfic = JSON.parse(formData.get("fanfic") as string);
			return await insertFanfic(fanfic);
		}

		default: {
			throw new Response("Method Not Allowed", { status: 405 });
		}
	}
};
