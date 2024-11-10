import * as consts from "@/consts";

export async function getFanfic(fanficId: string): Promise<string> {
	const url = `${consts.AO3_LINK}/works/${fanficId}?view_full_work=true&view_adult=true`;
	const request = new Request(url, {
		method: "GET",
	});
	const response = await fetch(request);
	return await response.text();
}
