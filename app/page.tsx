import MainPage from "@/components/MainPage";
import { listFanfics, selectSections } from "@/db/db";

export default async function Page() {
	const fanfics = await listFanfics();
	const sections = await selectSections();
	return (
		<div className="flex flex-col h-screen">
			<MainPage fanfics={fanfics} sections={sections} />
		</div>
	);
}
