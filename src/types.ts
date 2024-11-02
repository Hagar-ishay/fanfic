export interface Fanfic {
	id: string;
	title: string;
	author: string;
	summary: string;
	sourceUrl: string;
	updatedAt: string;
	hasUpdate: boolean;
}

export interface Section {
	id: string;
	name: string;
	fanfics: Fanfic[];
}
