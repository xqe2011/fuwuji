const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Max-Age": "86400",
};

function generateAlphanumericString(length: number): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charsLength = chars.length;
	const randomBytes = new Uint8Array(length);
	crypto.getRandomValues(randomBytes);
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(randomBytes[i] % charsLength);
	}
	return result;
}

async function hmac(secret: string, text: string) {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
	return Array.from(new Uint8Array(await crypto.subtle.sign({ name: "HMAC", hash: "SHA-256" }, key, encoder.encode(text)))).map((b) => b.toString(16).padStart(2, "0")).join("");
}


export interface Env {
	PUSHER_APPID: string,
	PUSHER_KEY: string,
	PUSHER_SECRET: string,
	PUSHER_CLUSTER: string,
	PUSHER_HOST: string,
	PUSHER_PORT: string,
	DASHBOARD_URL: string
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname == "/config" && request.method == "GET") {
			const channel = "private-" + generateAlphanumericString(8);
			return Response.json({
				"key": env.PUSHER_KEY,
				"cluster": env.PUSHER_CLUSTER,
				"host": env.PUSHER_HOST,
				"port": env.PUSHER_PORT,
				"channel": channel,
				"token": await hmac(env.PUSHER_SECRET, channel)
			}, { status: 200, headers: corsHeaders  });
		} else if (url.pathname == "/authorizeChannel" && request.method == "GET") {
			const dashboard = url.searchParams.get('dashboard');
			const version = url.searchParams.get('version');
			const socketID = url.searchParams.get('socket_id');
			const channel = url.searchParams.get('channel');
			const token = url.searchParams.get('token');
			if (typeof socketID !== "string" || typeof channel !== "string" || typeof token !== "string") {
				return Response.json({ "msg": "parameters invalid" }, { status: 400, headers: corsHeaders })
			}
			const urlWithoutPathname = `${url.protocol}//${url.host}${url.port ? ':' + url.port : ''}`;

			if (token !== await hmac(env.PUSHER_SECRET, channel)) {
				return Response.json({ "msg": "token invalid" }, { status: 403, headers: corsHeaders })
			}
			const auth = await hmac(env.PUSHER_SECRET, socketID + ":" + channel);
			let dashboardURL: string | undefined = undefined;
			if (dashboard !== null && version !== null) {
				dashboardURL = env.DASHBOARD_URL.replace("$DASHBOARD", dashboard).replace("$VERSION", version) + `?url=${urlWithoutPathname}&channel=${channel}&token=${token}`;
			}

			return Response.json({
				"auth": env.PUSHER_KEY + ":" + auth,
				"url": dashboardURL
			}, { status: 200, headers: corsHeaders  });
		}
		return Response.json({ "msg": "not found" }, { status: 404, headers: corsHeaders })
	},
};
