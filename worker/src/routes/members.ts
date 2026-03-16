import { Hono } from 'hono'
import { verify } from 'hono/jwt'

type Bindings = {
    DB: D1Database
    JWT_SECRET: string
}

type Variables = {
    userId: string
}

const members = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// Middleware to check authentication
members.use('*', async (c, next) => {
    const authHeader = c.req.header('Authorization')
    const token = authHeader?.split(' ')[1]
    if (!token) return c.json({ error: 'Unauthorized' }, 401)

    try {
        const secret = c.env.JWT_SECRET || 'fallback-secret-key-clbc-system-2026'
        const payload = await verify(token, secret, 'HS256') as any
        if (!payload || !payload.sub) return c.json({ error: 'Unauthorized' }, 401)
        c.set('userId', payload.sub as string)
    } catch (e) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    await next()
})

members.get('/', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM members ORDER BY full_name').all()
    return c.json(results)
})

members.post('/', async (c) => {
    const userId = c.get('userId')
    const { full_name, birthday, phone, email, notes } = await c.req.json()

    const id = crypto.randomUUID()

    await c.env.DB.prepare(
        'INSERT INTO members (id, user_id, full_name, birthday, phone, email, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
        .bind(id, userId, full_name, birthday || null, phone || null, email || null, notes || null)
        .run()

    // Fetch newly created
    const member = await c.env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(id).first()
    return c.json(member)
})

members.put('/:id', async (c) => {
    const userId = c.get('userId')
    const memberId = c.req.param('id')
    const { full_name, birthday, phone, email, notes } = await c.req.json()

    // Verify ownership
    const existing = await c.env.DB.prepare('SELECT id FROM members WHERE id = ? AND user_id = ?')
        .bind(memberId, userId)
        .first()

    if (!existing) return c.json({ error: 'Not found or unauthorized' }, 403)

    await c.env.DB.prepare(
        'UPDATE members SET full_name = ?, birthday = ?, phone = ?, email = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
        .bind(full_name, birthday || null, phone || null, email || null, notes || null, memberId)
        .run()

    const updatedMember = await c.env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(memberId).first()
    return c.json(updatedMember)
})

members.delete('/:id', async (c) => {
    const userId = c.get('userId')
    const memberId = c.req.param('id')

    const existing = await c.env.DB.prepare('SELECT id FROM members WHERE id = ? AND user_id = ?')
        .bind(memberId, userId)
        .first()

    if (!existing) return c.json({ error: 'Not found or unauthorized' }, 403)

    await c.env.DB.prepare('DELETE FROM members WHERE id = ?').bind(memberId).run()
    return c.json({ success: true })
})

export default members
