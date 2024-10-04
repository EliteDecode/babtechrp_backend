export interface GoogleProfile {
	id: string;
	displayName: string;
	_json: {
		email: string;
		picture?: string;
	};
}
