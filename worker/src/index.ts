import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
    DB: D1Database
    BUCKET_ATTENDANCE: R2Bucket
    BUCKET_GALLERY: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.get('/api/health', (c) => {
    return c.json({ status: 'ok', message: 'CLBC API is running' })
})

import auth from './routes/auth'
import members from './routes/members'
import attendance from './routes/attendance'
import gallery from './routes/gallery'

app.route('/api/auth', auth)
app.route('/api/members', members)
app.route('/api/attendance', attendance)
app.route('/api/gallery', gallery)

export default app
