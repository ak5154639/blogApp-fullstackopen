const bcrypt = require('bcryptjs')
const userRouter = require('express').Router()
const User = require('../models/user')


userRouter.post('/', async (request, response, next) => {
    const {username, name, password} = request.body

    if (!username || !password) {
      return response.status(400).json({
        error: 'username and password are required'
      })
    }

    if (username.length < 3) {
      return response.status(400).json({
        error: 'username must be at least 3 characters long'
      })
    }

    if (password.length < 3) {
      return response.status(400).json({
        error: 'password must be at least 3 characters long'
      })
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        hashedPassword
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

userRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, id: 1 })
    response.status(200).json(users)
})

module.exports = userRouter