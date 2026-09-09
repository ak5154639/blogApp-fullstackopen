const { test, after, beforeEach } = require('node:test')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const testHelper = require('./test_helper')
const assert = require('node:assert')
const app = require('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')
const config = require('../utils/config')

const api = supertest(app)

beforeEach(async () => {
    await mongoose.connect(config.MONGODB_URL, { family: 4 })
    
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)

    const user = new User({
        username: 'ramesh',
        name: 'Ramesh',
        hashedPassword: passwordHash
    })

    await user.save()
})

test('creation succeeds with a fresh username', async () => {
    const userAtStart = await testHelper.usersInDb()

    await api.post('/api/users').send(testHelper.testUser).expect(201).expect('Content-Type', /application\/json/)

    const usersAtEnd = await testHelper.usersInDb()

    assert.strictEqual(usersAtEnd.length, userAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(testHelper.testUser.username))
})

test('creation fails when username already exists', async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
        username: 'ramesh',
        name: 'Ramesh',
        password: 'mysecret'
    }

    const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)

    const usersAtEnd = await testHelper.usersInDb()

    assert(result.body.error)
    assert.strictEqual(usersAtStart.length, usersAtEnd.length)
})


test('creation fails when username is less than 3 characters', async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
        username: 'ab',
        name: 'Aniket',
        password: 'secret'
    }

    const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)

    const usersAtEnd = await testHelper.usersInDb()

    assert(result.body.error)
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})


test('creation fails when password is less than 3 characters', async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
        username: 'aniket',
        name: 'Aniket',
        password: 'ab'
    }

    const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)

    const usersAtEnd = await testHelper.usersInDb()

    assert(result.body.error)
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails when username is missing', async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
        name: 'Aniket',
        password: 'secret'
    }

    const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)

    const usersAtEnd = await testHelper.usersInDb()

    assert(result.body.error)
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails when password is missing', async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
        username: 'aniket',
        name: 'Aniket'
    }

    const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)

    const usersAtEnd = await testHelper.usersInDb()

    assert(result.body.error)
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

after(async () => {
    await mongoose.connection.close()
})