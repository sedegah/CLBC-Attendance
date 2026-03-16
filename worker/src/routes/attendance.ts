import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

type Bindings = {
    DB: D1Database
    BUCKET_ATTENDANCE: R2Bucket
}

type Variables = {
    userId: string
}

const attendance = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// Middleware to check authentication
attendance.use('*', async (c, next) => {
    const token = getCookie(c, 'auth_session')
    if (!token) return c.json({ error: 'Unauthorized' }, 401)

    const session = await c.env.DB.prepare('SELECT user_id, expires_at FROM sessions WHERE id = ?').bind(token).first()
    if (!session || new Date(session.expires_at as string) < new Date()) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('userId', session.user_id as string)
    await next()
})

attendance.get('/', async (c) => {
    const start = c.req.query('start')
    const end = c.req.query('end')

    let query = 'SELECT * FROM attendance_records'
    const params: string[] = []

    if (start && end) {
        query += ' WHERE attendance_date >= ? AND attendance_date <= ?'
        params.push(start, end)
    } else if (start) {
        query += ' WHERE attendance_date >= ?'
        params.push(start)
    } else if (end) {
        query += ' WHERE attendance_date <= ?'
        params.push(end)
    }

    query += ' ORDER BY attendance_date ASC' // Use ASC for the trend chart

    let stmt = c.env.DB.prepare(query)
    if (params.length > 0) {
        stmt = stmt.bind(...params)
    }

    const { results } = await stmt.all()
    return c.json(results)
})

attendance.get('/details', async (c) => {
    // Get all member attendance records
    const { results } = await c.env.DB.prepare('SELECT * FROM member_attendance').all()
    return c.json(results)
})

// Endpoint to handle the file upload (multipart form data) and inserting record
attendance.post('/', async (c) => {
    const userId = c.get('userId')
    const formData = await c.req.formData()

    const file = formData.get('file') as File
    const attendance_date = formData.get('attendance_date') as string
    const total_members = formData.get('total_members') as string || '0'
    const present_count = formData.get('present_count') as string || '0'
    const absent_count = formData.get('absent_count') as string || '0'
    const notes = formData.get('notes') as string || ''

    let file_name = ''
    let file_path = ''

    if (file && file.size > 0) {
        file_name = file.name
        file_path = `${userId}/${crypto.randomUUID()}-${file.name}`

        // Upload to R2 -> replacing Supabase Storage
        await c.env.BUCKET_ATTENDANCE.put(file_path, file)
    }

    const id = crypto.randomUUID()

    await c.env.DB.prepare(
        'INSERT INTO attendance_records (id, user_id, file_name, file_path, attendance_date, total_members, present_count, absent_count, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
        id, userId, file_name, file_path, attendance_date, parseInt(total_members), parseInt(present_count), parseInt(absent_count), notes
    ).run()

    const record = await c.env.DB.prepare('SELECT * FROM attendance_records WHERE id = ?').bind(id).first()
    return c.json(record)
})

attendance.get('/download/:id', async (c) => {
    const recordId = c.req.param('id')
    const record: any = await c.env.DB.prepare('SELECT file_path, file_name FROM attendance_records WHERE id = ?').bind(recordId).first()

    if (!record || !record.file_path) return c.json({ error: 'Not found' }, 404)

    const object = await c.env.BUCKET_ATTENDANCE.get(record.file_path)

    if (object === null) {
        return new Response('Object Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
        headers,
    });
})

export default attendance
