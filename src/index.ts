/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

/* export default {
	async fetch(request, env, ctx): Promise<Response> {
		return new Response("Hello from practice 5 pipeline!");
		//return new Response("Hello World!");
	},
} satisfies ExportedHandler<Env>; */



export interface Env {
	p6: D1Database;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const data = await this.queryDatabse(env.p6);
		return Response.json({ message: "Hello world 3!", dbData: data });
	},

	async queryDatabse(db: D1Database) {
		const { results } = await db.prepare("SELECT * FROM Users");.all();
	return results;
}
} satisfies ExportedHandler<Env>;