export type PosterListItem = {
	id: string;
	title: string;
	description?: string;
	author_name?: string;
	tags?: string[];
	blob_url: string;
	blob_url_print?: string;
	thumbnail_url?: string;
	width?: number;
	height?: number;
	file_size?: number;
	download_count?: number;
	status?: string;
	created: string;
	updated: string;
};
