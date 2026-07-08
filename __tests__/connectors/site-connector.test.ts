/** @jest-environment node */
const ORIGINAL_ENV = process.env

async function loadConnector(env: Record<string, string | undefined> = {}) {
  jest.resetModules()
  process.env = { ...ORIGINAL_ENV, ...env }
  return import('@/lib/site-connector')
}

afterEach(() => {
  process.env = ORIGINAL_ENV
  jest.restoreAllMocks()
})

describe('master panel public connector', () => {
  it('fetches bootstrap from the configured master panel and site code', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { site: { id: 'site-1', code: 'demo', name: 'Demo Site' } } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    global.fetch = fetchMock

    const { fetchSiteBootstrap } = await loadConnector({
      NEXT_PUBLIC_MASTER_API_URL: undefined,
      NEXT_PUBLIC_MASTER_PANEL_URL: 'https://master.example.com/',
      NEXT_PUBLIC_SITE_CODE: 'demo',
      NEXT_PUBLIC_FEED_REVALIDATE_SECONDS: '123',
    })

    const result = await fetchSiteBootstrap()

    expect(result?.site.code).toBe('demo')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://master.example.com/api/v1/public/demo/bootstrap',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 123 },
      }),
    )
  })

  it('supports fresh feed fetch with category and task query params', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { site: { id: '1', code: 'demo', name: 'Demo' }, posts: [] } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    global.fetch = fetchMock

    const { fetchSiteFeed } = await loadConnector({
      NEXT_PUBLIC_MASTER_API_URL: 'https://api.example.com',
      NEXT_PUBLIC_SITE_CODE: 'demo',
    })

    const result = await fetchSiteFeed(25, { fresh: true, category: 'Business', task: 'Article' })

    expect(result?.posts).toEqual([])
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/public/demo/feed?limit=25&category=business&task=article',
      expect.objectContaining({ method: 'GET', cache: 'no-store' }),
    )
  })



  it('uses last successful in-memory feed when master panel later times out', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          success: true,
          data: { site: { id: '1', code: 'demo', name: 'Demo' }, posts: [{ id: 'p1', slug: 'hello', title: 'Hello' }] },
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
      )
      .mockRejectedValueOnce(new Error('network down'))
    global.fetch = fetchMock

    const { fetchSiteFeed } = await loadConnector({
      NEXT_PUBLIC_MASTER_API_URL: 'https://api.example.com',
      NEXT_PUBLIC_SITE_CODE: 'demo',
      NEXT_PUBLIC_STALE_FALLBACK_SECONDS: '60',
      NODE_ENV: 'test',
    })

    const first = await fetchSiteFeed(10)
    const second = await fetchSiteFeed(10)

    expect(first?.posts[0]?.slug).toBe('hello')
    expect(second?.posts[0]?.slug).toBe('hello')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not call network when master panel env or site code is missing', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock

    const { fetchSiteFeed } = await loadConnector({
      NEXT_PUBLIC_MASTER_PANEL_URL: '',
      NEXT_PUBLIC_MASTER_API_URL: '',
      NEXT_PUBLIC_SITE_CODE: '',
    })

    await expect(fetchSiteFeed()).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns null instead of crashing when master panel responds with an error', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false, message: 'No site' }), { status: 404 }),
    )

    const { fetchSiteBootstrap } = await loadConnector({
      NEXT_PUBLIC_MASTER_API_URL: undefined,
      NEXT_PUBLIC_MASTER_PANEL_URL: 'https://master.example.com',
      NEXT_PUBLIC_SITE_CODE: 'missing-site',
      NODE_ENV: 'test',
    })

    await expect(fetchSiteBootstrap()).resolves.toBeNull()
  })
})

export {}
