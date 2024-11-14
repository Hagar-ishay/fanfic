import { deleteFanfic, updateFanfic } from "@/db/db";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const action = async ({ request, params }: LoaderFunctionArgs) => {
	const ficId = params.fanficId;
	if (!ficId) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}

	switch (request.method) {
		case "DELETE": {
			const deleted = await deleteFanfic(+ficId);
			return deleted;
		}
		case "PATCH": {
			const formData = await request.formData();
			const newSectionId = formData.get("newSectionId");
			const deleted = await updateFanfic(+ficId, { sectionId: newSectionId });
			return deleted;
		}
		default: {
			throw new Response("Method Not Allowed", { status: 405 });
		}
	}
};
