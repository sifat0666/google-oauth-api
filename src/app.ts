import express from 'express'
import config from 'config'
import connect from './utils/connect'
import log from './utils/logger'
import routes from './routes'
import  deserializeUser from './middleware/deseializeUser'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const port = config.get<number>('port')

export const app = express()

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


// app.use(deserializeUser)




app.listen(port , async ()=> {

    log.info(`Running at port ${port}`)

    await connect()

    routes(app)

})


// pear crouch ketchup reward solve water whisper muffin list salmon parade accuse