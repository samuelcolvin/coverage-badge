import {captureException} from './sentry'
import badge_svg from '!raw-loader!./badge.svg'

addEventListener('fetch', e => e.respondWith(handle(e)))

async function handle(event: FetchEvent) {
  const {request} = event

  try {
    return await route(event)
  } catch (exc) {
    console.error('error handling request:', request)
    console.error('error:', exc)
    captureException(event, exc)
    const body = `\nError occurred on the edge:\n\n${exc.message}\n${exc.stack}\n`
    return new Response(body, {status: 500})
  }
}

async function route(event: FetchEvent) {
  const {request} = event
  const {pathname, searchParams} = new URL(request.url)
  if (pathname == '/favicon.ico') {
    return fetch('http://smokeshow.helpmanual.io/favicon.ico')
  } else if (pathname == '/badge.svg') {
    return await badge(searchParams)
  } else if (pathname == '/') {
    return new Response(`
    <h1>coverage-badge</h1>
    <p>
      See <a href="https://github.com/samuelcolvin/coverage-badge">github.com/samuelcolvin/coverage-badge</a>
      for more information.
    </p>`, {headers: {'content-type': 'text/html'}})
  }
  return error('Page Not Found', 404)
}

interface Status {
  description: string,
  context: string
}

async function badge(searchParams: URLSearchParams) {
  const a = {
    owner: searchParams.get('owner'),
    repo: searchParams.get('repo'),
    branch: searchParams.get('branch') || 'master',
    context: searchParams.get('context') || 'smokeshow',
  }

  if (Object.values(a).some(v => v == null)) {
    return error('"owner" and "repo" GET arguments are required', 400)
  }
  const gh_url = `https://api.github.com/repos/${a.owner}/${a.repo}/commits/${a.branch}/status`
  const r = await fetch(gh_url, {headers: {'user-agent': 'https://github.com/samuelcolvin/coverage-badge'}})
  if (r.status != 200) {
    const body = await r.text()
    return error(`Unexpected response from "${gh_url}" ${r.status} body:\n${body}`, 502)
  }
  const data = await r.json()

  const status = (data.statuses as Status[]).find(s => s.context == a.context)
  if (!status) {
    return error(`Status with context "${a.context}" not found`, 400)
  }

  const m = status.description.match(/([\d.]+)%/)
  if (!m) {
    return error(`Coverage not found in status description: "${status.description}"`, 400)
  }
  const coverage = parseFloat(m[1])

  const svg = badge_svg.replaceAll('{cov}', coverage.toFixed(0) + '%')
  return new Response(svg, {headers: {'content-type': 'image/svg+xml'}})
}

const error = (msg: string, status: number) => new Response(msg, {status})
