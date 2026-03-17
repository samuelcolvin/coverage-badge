import {captureException} from './sentry'
import {HttpError} from './utils'
import badge_svg from './badge'

export interface Env {
  GITHUB_TOKEN: string
  SENTRY_DSN: string
  COVERAGE_CACHE: KVNamespace
  DEBUG?: string
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await route(request, env)
    } catch (exc) {
      if (exc instanceof HttpError) {
        console.warn(exc.message)
        return exc.response()
      }
      console.error('error handling request:', request)
      console.error('error:', exc)
      captureException(request, ctx, env, exc as Error)
      const body = `\nError occurred on the edge:\n\n${(exc as Error).message}\n${(exc as Error).stack}\n`
      return new Response(body, {status: 500})
    }
  },
}

const badge_regex = /^\/([^/]+)\/([^.]+)\.svg/
const redirect_regex = /^\/redirect\/([^/]+)\/([^/]+)/

async function route(request: Request, env: Env) {
  const {pathname, searchParams} = new URL(request.url)
  if (pathname == '/favicon.ico') {
    return fetch('http://smokeshow.helpmanual.io/favicon.ico')
  }

  const m1 = pathname.match(badge_regex)
  if (m1) {
    return await badge(m1[1], m1[2], searchParams, env)
  }

  const m2 = pathname.match(redirect_regex)
  if (m2) {
    return await redirect(m2[1], m2[2], searchParams, env)
  }

  if (pathname == '/') {
    return new Response(
      `
    <h1>coverage-badge</h1>
    <p>
      See <a href="https://github.com/samuelcolvin/coverage-badge">github.com/samuelcolvin/coverage-badge</a>
      for more information.
    </p>`,
      {headers: {'content-type': 'text/html'}},
    )
  }
  throw new HttpError(404, 'Page Not Found')
}

async function badge(owner: string, repo: string, searchParams: URLSearchParams, env: Env): Promise<Response> {
  const {status, statuses, matchParam} = await status_info(owner, repo, searchParams, env)

  let coverage = '??%'
  let message
  if (status) {
    const m = status.description.match(/([\d.]+)%/)
    if (m) {
      const cov_float = parseFloat(m[1])
      coverage = cov_float.toFixed(0) + '%'
      message = `Found coverage percentage ${cov_float} in status:\n"${JSON.stringify(status, null, 2)}"`
    } else {
      message = `coverage percentage not found in status:\n"${JSON.stringify(status, null, 2)}"`
    }
  } else {
    const d = JSON.stringify(statuses.map(s => s.description))
    message = `No status found which matched regex ${matchParam}, status descriptions: ${d}`
  }

  const svg = badge_svg.replaceAll('{cov}', coverage).replaceAll('{message}', message)
  const headers = {
    'content-type': 'image/svg+xml',
    'cache-control': 'private, no-store',
    'expires': new Date().toUTCString(),
  }
  return new Response(svg, {headers})
}

async function redirect(owner: string, repo: string, searchParams: URLSearchParams, env: Env): Promise<Response> {
  const { status, statuses, matchParam } = await status_info(owner, repo, searchParams, env)

  if (!status) {
    const d = JSON.stringify(statuses.map(s => s.description))
    throw new HttpError(400, `No status found which matched regex ${matchParam}, status descriptions: ${d}`)
  }

  return Response.redirect(status.target_url, 307)
}

interface Status {
  description: string
  target_url: string
}

interface StatusInfo {
  status?: Status
  statuses: Status[]
  matchParam: string
}

interface Commit {
  sha: string
  url: string
}

async function status_info(owner: string, repo: string, searchParams: URLSearchParams, env: Env): Promise<StatusInfo> {
  const matchParam = searchParams.get('match') || '^coverage'
  const branch = searchParams.get('branch') || ''

  const cacheKey = `${owner}/${repo}/${branch}/${matchParam}`
  const cached = await env.COVERAGE_CACHE.get(cacheKey, 'json') as StatusInfo | null
  if (cached) {
    console.log(`cache hit for ${cacheKey}`)
    return cached
  }

  const newSearchParams = new URLSearchParams({per_page: '5'})
  if (branch) {
    newSearchParams.set('sha', branch)
  }
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?${newSearchParams.toString()}`

  const commits: Commit[] = await get(url, env)

  let i = 0;
  for (const commit of commits) {
    i += 1
    const data: {statuses: Status[]} = await get(`${commit.url}/status`, env)
    if (data.statuses.length > 0) {
      console.log(`${i} commit ${commit.sha} has ${data.statuses.length} statuses, using commit`)
      const match = RegExp(matchParam, 'i')
      const result: StatusInfo = {
        status: data.statuses.find(s => s.description.match(match)),
        statuses: data.statuses,
        matchParam
      }
      await env.COVERAGE_CACHE.put(cacheKey, JSON.stringify(result), {expirationTtl: 300})
      return result
    } else {
      console.log(`${i} commit ${commit.sha} has no statuses, continuing`)
    }
  }
  return {
    statuses: [],
    matchParam
  }
}

async function get(url: string, env: Env): Promise<any> {
  const headers = {
    'User-Agent': 'https://github.com/samuelcolvin/coverage-badge',
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10'
  }
  const r = await fetch(url, {headers})
  if (r.status != 200) {
    const body = await r.text()
    throw new HttpError(502,`Unexpected response from "${url}" ${r.status} body:\n${body}`)
  }
  return await r.json()
}
