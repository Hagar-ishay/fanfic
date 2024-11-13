import type { Fanfic } from "@/db/types";
import { sendToKindle } from "@/server/sendToKindle";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
	const formData = await request.formData();
	const kindleEmail = formData.get("kindleEmail") as string;
	const fanfic: Fanfic = JSON.parse(formData.get("fanfic") as string);
	return await sendToKindle(kindleEmail, fanfic);
};
