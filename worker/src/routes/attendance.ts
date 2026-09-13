import { Hono } from 'hono'
import { verify } from 'hono/jwt'

type Bindings = {
    DB: D1Database
    BUCKET_ATTENDANCE: R2Bucket
    JWT_SECRET: string
}

type Variables = {
    userId: string
}

const attendance = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// Middleware to check authentication
attendance.use('*', async (c, next) => {
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
    const isManual = formData.get('manual') === 'true'

    if (!attendance_date) {
        return c.json({ error: 'attendance_date is required' }, 400)
    }

    let file_name = ''
    let file_path = ''

    // Only upload to R2 if a real file is provided (not a manual entry)
    if (!isManual && file && file.size > 0) {
        file_name = file.name
        file_path = `${userId}/${crypto.randomUUID()}-${file.name}`

        // Upload to R2
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

attendance.delete('/:id', async (c) => {
    const recordId = c.req.param('id')

    // Fetch the record so we can clean up R2
    const record: any = await c.env.DB.prepare(
        'SELECT id, file_path FROM attendance_records WHERE id = ?'
    ).bind(recordId).first()

    if (!record) return c.json({ error: 'Record not found' }, 404)

    // Delete file from R2 if one was stored
    if (record.file_path) {
        await c.env.BUCKET_ATTENDANCE.delete(record.file_path)
    }

    // Delete linked member attendance rows first (FK safety)
    await c.env.DB.prepare(
        'DELETE FROM member_attendance WHERE attendance_record_id = ?'
    ).bind(recordId).run()

    // Delete the attendance record itself
    await c.env.DB.prepare(
        'DELETE FROM attendance_records WHERE id = ?'
    ).bind(recordId).run()

    return c.json({ success: true })
})

export default attendance
