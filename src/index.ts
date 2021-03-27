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

const badge_regex = /^\/([^/]+)\/([^.]+)\.svg/

async function route(event: FetchEvent) {
  const {request} = event
  const {pathname, searchParams} = new URL(request.url)
  if (pathname == '/favicon.ico') {
    return fetch('http://smokeshow.helpmanual.io/favicon.ico')
  }
  const m = pathname.match(badge_regex)
  if (m) {
    return await badge(m[1], m[2], searchParams)
  } else if (pathname == '/') {
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
  return error('Page Not Found', 404)
}

interface Status {
  description: string
  context: string
}

async function badge(owner: string, repo: string, searchParams: URLSearchParams) {
  const branch = searchParams.get('branch') || 'master'
  const context = searchParams.get('context') || 'smokeshow'

  const gh_url = `https://api.github.com/repos/${owner}/${repo}/commits/${branch}/status`
  const r = await fetch(gh_url, {headers: {'user-agent': 'https://github.com/samuelcolvin/coverage-badge'}})
  if (r.status != 200) {
    const body = await r.text()
    return error(`Unexpected response from "${gh_url}" ${r.status} body:\n${body}`, 502)
  }
  const data = await r.json()

  let coverage = '??%'

  const status = (data.statuses as Status[]).find(s => s.context == context)
  if (status) {
    const m = status.description.match(/([\d.]+)%/)
    if (m) {
      coverage = parseFloat(m[1]).toFixed(0) + '%'
    }
  }

  const svg = badge_svg.replaceAll('{cov}', coverage)
  return new Response(svg, {headers: {'content-type': 'image/svg+xml'}})
}

const error = (msg: string, status: number) => new Response(msg, {status})
