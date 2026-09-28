import { getAuth } from '@/lib/auth/server'

function withPathAlias(handler) {
  return async (request, context) => {
    const params = await context.params
    return handler(request, {
      ...context,
      params: Promise.resolve({
        path: params.path || params.all || [],
      }),
    })
  }
}

export async function GET(request, context) {
  const { GET: handleGet } = getAuth().handler()
  return withPathAlias(handleGet)(request, context)
}

export async function POST(request, context) {
  const { POST: handlePost } = getAuth().handler()
  return withPathAlias(handlePost)(request, context)
}
