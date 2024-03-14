export interface Env {
	PUSHER_APPID: string,
	PUSHER_KEY: string,
	PUSHER_SECRET: string,
	PUSHER_CLUSTER: string,
	PUSHER_HOST: string,
	PUSHER_PORT: string,
	DASHBOARD_URL: string
};

export type Nullable<T> = T | null;
