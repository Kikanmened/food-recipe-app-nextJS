import { auth } from '@/lib/auth/server'

const { GET: handleGet, POST: handlePost } = auth.handler()

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

export const GET = withPathAlias(handleGet)
export const POST = withPathAlias(handlePost)
