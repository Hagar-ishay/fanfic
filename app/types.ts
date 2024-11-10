import type { DateTime } from "luxon";

export interface Fanfic {
	id: string;
	title: string;
	summary: string;
	author: string;
	authorUrl: string;
	sourceUrl: string;
	downloadLinks: DownloadLink[];
	createdAt: DateTime | null;
	updatedAt?: DateTime | null;
	completedAt?: DateTime | null;
	downloadedAt?: DateTime | null;
	tags: Tag[];
	rating?: 1 | 2 | 3 | 4 | 5 | null;
}

export interface Section {
	id: string;
	name: string;
	fanfics: Fanfic[];
	isOpen: boolean;
}

export interface Tag {
	category: string;
	values: string[];
}

export interface DownloadLink {
	type: string;
	link: string;
}
