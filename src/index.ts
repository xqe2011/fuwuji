import { Env } from "./types";
import { config, authorizeChannel, authorizeUser } from "./routes";
import { response } from "./tools";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const params = url.searchParams;

		if (url.pathname == "/config" && request.method == "GET") {
			return config(env);
		} else if (url.pathname == "/authorizeChannel" && request.method == "GET") {
			return authorizeChannel(env, url, params.get("dashboard"), params.get("version"), params.get("socket_id"), params.get("channel"), params.get("token"));
		} else if (url.pathname == "/authorizeUser" && request.method == "GET") {
			return authorizeUser(env, params.get("role"), params.get("channel"), params.get("socket_id"), params.get("token"));
		}
		return response({ "msg": "not found" }, 404);
	},
};
