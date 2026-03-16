import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { sign, verify, decode } from 'hono/jwt'

type Bindings = {
    DB: D1Database;
    JWT_SECRET: string;
}

const auth = new Hono<{ Bindings: Bindings }>()

// Crypto simple hash for demo purposes (In production use scrypt/bcrypt or WebCrypto PBKDF2)
// Using Web Crypto API natively
const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

// Ensure JWT_SECRET is provided or use a fallback for local dev
const getJwtSecret = (c: any) => c.env.JWT_SECRET || 'fallback-secret-key-clbc-system-2026';

auth.post('/login', async (c) => {
    const { email, password } = await c.req.json()
    const db = c.env.DB

    const hashedPassword = await hashPassword(password)

    const user = await db.prepare('SELECT id, full_name, role FROM users WHERE email = ? AND password_hash = ?')
        .bind(email, hashedPassword)
        .first()

    if (!user) {
        return c.json({ error: 'Invalid email or password' }, 401)
    }

    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

    await db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
        .bind(sessionId, user.id as string, expiresAt.toISOString())
        .run()

    // Generate JWT
    const payload = {
        sub: user.id as string,
        sessionId: sessionId,
        role: user.role as string,
        exp: Math.floor(expiresAt.getTime() / 1000)
    }
    const token = await sign(payload, getJwtSecret(c))

    setCookie(c, 'auth_session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        expires: expiresAt,
        path: '/'
    })

    return c.json({ user })
})

auth.post('/signup', async (c) => {
    const { email, password, full_name } = await c.req.json()
    const db = c.env.DB

    // Check if exists
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
    if (existing) {
        return c.json({ error: 'Email already exists' }, 400)
    }

    const hashedPassword = await hashPassword(password)
    const userId = crypto.randomUUID()

    await db.prepare('INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)')
        .bind(userId, email, hashedPassword, full_name || '', 'member')
        .run()

    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

    await db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
        .bind(sessionId, userId, expiresAt.toISOString())
        .run()

    // Generate JWT
    const payload = {
        sub: userId,
        sessionId: sessionId,
        role: 'member',
        exp: Math.floor(expiresAt.getTime() / 1000)
    }
    const token = await sign(payload, getJwtSecret(c))

    setCookie(c, 'auth_session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        expires: expiresAt,
        path: '/'
    })

    return c.json({
        user: { id: userId, full_name, role: 'member' }
    })
})

auth.post('/logout', async (c) => {
    const token = getCookie(c, 'auth_session')
    if (token) {
        try {
            const decoded = decode(token)
            const payload = decoded.payload as any
            if (payload && payload.sessionId) {
                await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(payload.sessionId).run()
            }
        } catch (e) {
            // Ignore token decode errors on logout
        }
    }
    deleteCookie(c, 'auth_session', { path: '/' })
    return c.json({ success: true })
})

auth.get('/me', async (c) => {
    const token = getCookie(c, 'auth_session')
    if (!token) return c.json({ user: null })

    const db = c.env.DB
    let payload;
    try {
        payload = await verify(token, getJwtSecret(c), 'HS256')
    } catch (e) {
        return c.json({ user: null })
    }

    const sessionId = (payload as any).sessionId
    const session = await db.prepare('SELECT user_id, expires_at FROM sessions WHERE id = ?').bind(sessionId).first()

    if (!session || new Date(session.expires_at as string) < new Date()) {
        if (session) {
            await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
        }
        return c.json({ user: null })
    }

    const user = await db.prepare('SELECT id, full_name, email, role FROM users WHERE id = ?').bind(session.user_id).first()
    return c.json({ user })
})

export default auth
