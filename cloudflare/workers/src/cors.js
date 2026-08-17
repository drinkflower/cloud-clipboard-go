const corsHeadersBase = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-File-Name, X-File-Size, X-Room-Auth-Tokens',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Type, Content-Disposition',
  'Access-Control-Max-Age': '86400'
};

// Route handlers spread this object into responses. The top-level Worker adds
// the request-specific Origin header after it has validated the request.
export const corsHeaders = { ...corsHeadersBase };

function allowedOrigin(env) {
  return String(env.ALLOWED_ORIGIN || '').replace(/\/$/, '');
}

export function isAllowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === allowedOrigin(env);
}

export function requiresAllowedOrigin(request) {
  const pathname = new URL(request.url).pathname;
  return pathname.startsWith('/api/');
}

export function forbiddenOriginResponse() {
  return new Response(JSON.stringify({
    error: 'Forbidden',
    message: '不允许的请求来源',
  }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function applyCorsHeaders(response, request, env) {
  // Cloudflare 的 WebSocket 101 响应头不可再修改；浏览器 WebSocket
  // 不使用 CORS 响应头，来源已在 fetch 入口处校验。
  if (request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
    return response;
  }

  if (isAllowedOrigin(request, env)) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin(env));
    Object.entries(corsHeadersBase).forEach(([name, value]) => response.headers.set(name, value));
  }
  return response;
}

export function handleCors(request, env) {
  if (!isAllowedOrigin(request, env)) {
    return forbiddenOriginResponse();
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin(env),
      ...corsHeadersBase,
    },
  });
}
