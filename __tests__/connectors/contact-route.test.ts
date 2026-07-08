/** @jest-environment node */
const ORIGINAL_ENV = process.env

async function loadContactRoute(env: Record<string, string | undefined> = {}) {
  jest.resetModules()
  process.env = { ...ORIGINAL_ENV, ...env }
  return import('@/app/api/contact/route')
}

function jsonRequest(payload: Record<string, unknown>, headers?: HeadersInit) {
  return new Request('https://demo.example.com/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: JSON.stringify(payload),
  })
}

afterEach(() => {
  process.env = ORIGINAL_ENV
  jest.restoreAllMocks()
})

describe('contact form master panel connector', () => {
  it('posts valid contact submissions to the configured master panel endpoint', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    global.fetch = fetchMock

    const { POST } = await loadContactRoute({
      NEXT_PUBLIC_MASTER_API_URL: 'https://master.example.com/',
      NEXT_PUBLIC_SITE_CODE: 'demo-site',
    })

    const response = await POST(jsonRequest(
      {
        name: 'Yash Nihalani',
        email: 'YASH@Example.COM ',
        phone: '7737738330',
        subject: 'Need details',
        message: 'Please contact me.',
      },
      { referer: 'https://demo.example.com/contact' },
    ))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://master.example.com/api/v1/public/demo-site/contact',
      expect.objectContaining({ method: 'POST', cache: 'no-store' }),
    )

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(requestBody).toMatchObject({
      name: 'Yash Nihalani',
      email: 'yash@example.com',
      phone: '7737738330',
      subject: 'Need details',
      message: 'Please contact me.',
      sourceUrl: 'https://demo.example.com/contact',
      meta: expect.objectContaining({
        siteName: expect.any(String),
        siteUrl: expect.any(String),
        form: 'contact-page',
      }),
    })
    expect(Object.keys(requestBody).sort()).toEqual(['email', 'message', 'meta', 'name', 'phone', 'sourceUrl', 'subject'].sort())
  })

  it('rejects missing required fields before calling master panel', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock
    const { POST } = await loadContactRoute({ NEXT_PUBLIC_SITE_CODE: 'demo-site' })

    const response = await POST(jsonRequest({ name: '', email: 'bad', message: '' }))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toContain('required')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects invalid email before calling master panel', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock
    const { POST } = await loadContactRoute({ NEXT_PUBLIC_SITE_CODE: 'demo-site' })

    const response = await POST(jsonRequest({ name: 'Yash', email: 'not-an-email', message: 'Hello' }))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toContain('valid email')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('treats honeypot submissions as successful without calling master panel', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock
    const { POST } = await loadContactRoute({ NEXT_PUBLIC_SITE_CODE: 'demo-site' })

    const response = await POST(jsonRequest({ company: 'bot value', name: 'Bot', email: 'bot@example.com', message: 'Spam' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns upstream master panel errors clearly', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Site token rejected' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const { POST } = await loadContactRoute({
      NEXT_PUBLIC_MASTER_PANEL_URL: 'https://master.example.com',
      NEXT_PUBLIC_SITE_CODE: 'demo-site',
    })

    const response = await POST(jsonRequest({ name: 'Yash', email: 'yash@example.com', message: 'Hello' }))
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.message).toBe('Site token rejected')
  })
})

export {}
