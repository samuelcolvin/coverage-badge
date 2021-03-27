import {captureException} from './sentry'
import {HttpError} from './utils'
import badge_svg from '!raw-loader!./badge.svg'

addEventListener('fetch', e => e.respondWith(handle(e)))

async function handle(event: FetchEvent) {
  const {request} = event

  try {
    return await route(event)
  } catch (exc) {
    if (exc instanceof HttpError) {
      console.warn(exc.message)
      return exc.response()
    }
    console.error('error handling request:', request)
    console.error('error:', exc)
    captureException(event, exc)
    const body = `\nError occurred on the edge:\n\n${exc.message}\n${exc.stack}\n`
    return new Response(body, {status: 500})
  }
}

const badge_regex = /^\/([^/]+)\/([^.]+)\.svg/
const redirect_regex = /^\/redirect\/([^/]+)\/([^/]+)/

async function route(event: FetchEvent) {
  const {request} = event
  const {pathname, searchParams} = new URL(request.url)
  if (pathname == '/favicon.ico') {
    return fetch('http://smokeshow.helpmanual.io/favicon.ico')
  }

  const m1 = pathname.match(badge_regex)
  if (m1) {
    return await badge(m1[1], m1[2], searchParams)
  }

  const m2 = pathname.match(redirect_regex)
  if (m2) {
    return await redirect(m2[1], m2[2], searchParams)
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

async function badge(owner: string, repo: string, searchParams: URLSearchParams): Promise<Response> {
  const {status, statuses, match} = await status_info(owner, repo, searchParams)

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
    message = `No status found which matched regex ${match}, status descriptions: ${d}`
  }

  const svg = badge_svg.replaceAll('{cov}', coverage).replaceAll('{message}', message)
  const headers = {
    'content-type': 'image/svg+xml',
    'cache-control': 'private, no-store',
    'expires': new Date().toUTCString(),
  }
  return new Response(svg, {headers})
}

async function redirect(owner: string, repo: string, searchParams: URLSearchParams): Promise<Response> {
  const {status, statuses, match} = await status_info(owner, repo, searchParams)

  if (!status) {
    const d = JSON.stringify(statuses.map(s => s.description))
    throw new HttpError(400, `No status found which matched regex ${match}, status descriptions: ${d}`)
  }

  return Response.redirect(status.target_url, 307)
}

interface Status {
  description: string
  target_url: string
}

interface StatusInfo {
  status: Status | undefined
  statuses: Status[]
  match: RegExp
}


async function status_info(owner: string, repo: string, searchParams: URLSearchParams): Promise<StatusInfo> {
  const branch = searchParams.get('branch') || 'master'
  const match = RegExp(searchParams.get('match') || '^coverage', 'i')

  const gh_url = `https://api.github.com/repos/${owner}/${repo}/commits/${branch}/status`
  const r = await fetch(gh_url, {headers: {'user-agent': 'https://github.com/samuelcolvin/coverage-badge'}})
  if (r.status != 200) {
    const body = await r.text()
    throw new HttpError(502,`Unexpected response from "${gh_url}" ${r.status} body:\n${body}`)
  }
  const data: {statuses: Status[]} = await r.json()

  return {
    status: data.statuses.find(s => s.description.match(match)),
    statuses: data.statuses,
    match
  }
}
