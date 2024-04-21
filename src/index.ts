export default {
	async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const url = new URL(req.url);

			if (url.pathname === '/') {
				return new Response('Service is running. Specify a URL to fetch.', { status: 200 });
			}

			const cacheKey = url.pathname.substring(1);

			const fetchResponse = await fetch(cacheKey, {
				cf: {
					cacheTtl: 60 * 60 * 1, // 1 hour
					cacheEverything: true,
					cacheKey: cacheKey,
				},
			});

			const cacheHit = fetchResponse.headers.has('CF-Cache-Status') ? fetchResponse.headers.get('CF-Cache-Status') === 'HIT' : false;

			const headers = new Headers(fetchResponse.headers);
			headers.set('X-Cache-Status', cacheHit ? 'Hit' : 'Miss');

			const newResponse = new Response(fetchResponse.body, {
				status: fetchResponse.status,
				statusText: fetchResponse.statusText,
				headers: headers,
			});

			return newResponse;
		} catch (e) {
			if (e instanceof Error) {
				return new Response('Error fetching the URL: ' + e.message, { status: 500 });
			}

			return new Response('Unknown error fetching the URL', { status: 500 });
		}
	},
};
