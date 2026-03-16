import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

type Bindings = {
    DB: D1Database
    BUCKET_GALLERY: R2Bucket
}

const gallery = new Hono<{ Bindings: Bindings }>()

// Middleware to check authentication for mutation operations
gallery.use('*', async (c, next) => {
    if (c.req.method === 'GET') return next() // allow public read

    const token = getCookie(c, 'auth_session')
    if (!token) return c.json({ error: 'Unauthorized' }, 401)

    const session = await c.env.DB.prepare('SELECT user_id, expires_at FROM sessions WHERE id = ?').bind(token).first()
    if (!session || new Date(session.expires_at as string) < new Date()) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    // Verify admin access for gallery
    const user = await c.env.DB.prepare('SELECT role FROM users WHERE id = ?').bind(session.user_id).first()
    if (!user || user.role !== 'admin') {
        return c.json({ error: 'Forbidden. Admin privileges required.' }, 403)
    }

    c.set('userId', session.user_id)
    await next()
})

// Albums
gallery.get('/albums', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM gallery_albums ORDER BY created_at DESC').all()
    return c.json(results)
})

gallery.post('/albums', async (c) => {
    const userId = c.get('userId')
    const { name, description } = await c.req.json()

    const id = crypto.randomUUID()

    await c.env.DB.prepare(
        'INSERT INTO gallery_albums (id, name, description, created_by) VALUES (?, ?, ?, ?)'
    )
        .bind(id, name, description || '', userId as string)
        .run()

    // Fetch newly created
    const album = await c.env.DB.prepare('SELECT * FROM gallery_albums WHERE id = ?').bind(id).first()
    return c.json(album)
})

// Images
gallery.get('/images', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM gallery_images ORDER BY created_at DESC').all()
    return c.json(results)
})

// Image Upload
gallery.post('/images', async (c) => {
    const userId = c.get('userId')
    const formData = await c.req.formData()

    const file = formData.get('file') as File
    const album_id = formData.get('album_id') as string
    const title = formData.get('title') as string || ''
    const description = formData.get('description') as string || ''

    if (!file) return c.json({ error: 'File is required' }, 400)

    const file_name = file.name
    const file_path = `${crypto.randomUUID()}-${file.name}`

    // Upload to R2 -> replacing Supabase Storage gallery bucket
    await c.env.BUCKET_GALLERY.put(file_path, file)

    const id = crypto.randomUUID()

    await c.env.DB.prepare(
        'INSERT INTO gallery_images (id, album_id, title, description, file_name, file_path, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
        id, album_id || null, title, description, file_name, file_path, userId
    ).run()

    const image = await c.env.DB.prepare('SELECT * FROM gallery_images WHERE id = ?').bind(id).first()
    return c.json(image)
})

// Serve images from R2 publicly
gallery.get('/image-file/:path', async (c) => {
    const path = c.req.param('path')
    const object = await c.env.BUCKET_GALLERY.get(path)

    if (object === null) {
        return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, { headers });
})

export default gallery
