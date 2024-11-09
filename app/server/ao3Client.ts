export async function getFanfic(url: string): Promise<string> {
	const request = new Request(url, {
		method: "GET",
	});
	const response = await fetch(request);
	return await response.text();
}
