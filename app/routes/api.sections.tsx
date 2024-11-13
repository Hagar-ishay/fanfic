import { selectSections } from "@/db/db"; // Assuming this is your DB function
import { json } from "@remix-run/node";

export async function loader() {
	const sections = await selectSections();
	return json({ sections });
}
