import { listFanfics } from "@/db/db";
import { type LoaderFunctionArgs, json } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
	const fanfics = await listFanfics();
	return json({ fanfics });
}
