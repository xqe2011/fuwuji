const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Max-Age": "86400",
};

export function generateAlphanumericString(length: number) {
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

export async function hmac(secret: string, text: string) {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
	return Array.from(new Uint8Array(await crypto.subtle.sign({ name: "HMAC", hash: "SHA-256" }, key, encoder.encode(text)))).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function response(data: any, status: number) {
	return Response.json(data, { status, headers: corsHeaders });
}