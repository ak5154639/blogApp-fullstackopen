const express = require('express')
const path = require('path')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()




app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.json())
app.use(middleware.getTokenFrom)
app.use(middleware.requestLogger)

if (process.env.NODE_ENV === 'test') {
  const testRouter = require('./controllers/testing')
  app.use('/api/testing', testRouter)
}

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.get(/^(?!\/api(?:\/|$)).*/, (request, response) => {
  response.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app