import { hmac, generateAlphanumericString, response } from "./tools";
import { Nullable, Env } from "./types";

export async function authorizeUser(env: Env, role: Nullable<string>, channel: Nullable<string>, socketID: Nullable<string>, token: Nullable<string>) {
	if ((role !== "server" && role !== "client") || typeof socketID !== "string" || typeof channel !== "string" || typeof token !== "string") {
		return response({ "msg": "parameters invalid" }, 403)
	}
	if (token !== await hmac(env.PUSHER_SECRET, channel)) {
		return response({ "msg": "token invalid" }, 403)
	}
	const data = JSON.stringify({
		"id": role === "server" ? (role + "-" + channel) : (role + "-" + generateAlphanumericString(8)),
		"watchlist": role === "server" ? [] : [ "server-" + channel ],
	});
	const auth = await hmac(env.PUSHER_SECRET, socketID + "::user::" + data);
	return response({ "auth": env.PUSHER_KEY + ":" + auth, "user_data": data }, 200);
}

export async function config(env: Env) {
    const channel = "private-" + generateAlphanumericString(8);
	return response({
		"key": env.PUSHER_KEY,
		"cluster": env.PUSHER_CLUSTER,
		"host": env.PUSHER_HOST,
		"port": env.PUSHER_PORT,
		"channel": channel,
		"token": await hmac(env.PUSHER_SECRET, channel)
	}, 200);
}

export async function authorizeChannel(env: Env, url: URL, dashboard: Nullable<string>, version: Nullable<string>, socketID: Nullable<string>, channel: Nullable<string>, token: Nullable<string>) {
	if (typeof socketID !== "string" || typeof channel !== "string" || typeof token !== "string") {
		return response({ "msg": "parameters invalid" }, 400)
	}
	const urlWithoutPathname = `${url.protocol}//${url.host}${url.port ? ':' + url.port : ''}`;

	if (token !== await hmac(env.PUSHER_SECRET, channel)) {
		return response({ "msg": "token invalid" }, 403)
	}
	const auth = await hmac(env.PUSHER_SECRET, socketID + ":" + channel);
	let dashboardURL: string | undefined = undefined;
	if (dashboard !== null && version !== null) {
		dashboardURL = env.DASHBOARD_URL.replace("$DASHBOARD", dashboard).replace("$VERSION", version) + `?url=${urlWithoutPathname}&channel=${channel}&token=${token}`;
	}

	return response({ "auth": env.PUSHER_KEY + ":" + auth, "url": dashboardURL }, 200);
}