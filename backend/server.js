import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import planRoutes from './routes/plan.js'
import matchRoutes from './routes/match.js'
import checkinRoutes from './routes/checkin.js'
import studyGroupRoutes from './routes/studyGroup.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', planRoutes)
app.use('/api', matchRoutes)
app.use('/api', checkinRoutes)
app.use('/api', studyGroupRoutes)

app.get('/', (req, res) => res.send('OnboardX API is running'))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`OnboardX backend listening on port ${PORT}`))