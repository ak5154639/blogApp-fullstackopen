const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const testHelper = require('./test_helper')
const mongoose = require('mongoose')
const config = require('../utils/config')
const bcrypt = require('bcryptjs')

const api = supertest(app)

let token

beforeEach(async () => {
    await mongoose.connect(config.MONGODB_URL, { family: 4 })

    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash(testHelper.testUser.password, 10)

    const user = new User({
        username: testHelper.testUser.username,
        name: testHelper.testUser.name,
        hashedPassword: passwordHash
    })
    await user.save()

    const blogObj = testHelper.initialBlogs.map((blog => new Blog({
        ...blog,
        user: user._id
    })))
    await Promise.all(blogObj.map(blog => blog.save()))

    const loginResponse = await api.post('/api/login').send({ username: testHelper.testUser.username, password: testHelper.testUser.password })

    token = loginResponse.body.token
})


test('blogs are returned as json', async () => {
    await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
})

test('blogs are returned with correct number of blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, testHelper.initialBlogs.length)
})

test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    assert(response.body[0].id)
    assert.strictEqual(response.body[0]._id, undefined)
    assert.strictEqual(response.body[0].__v, undefined)
})

test('post request saving a new post', async () => {
    const newBlog = {
        title: "Cry wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
    }

    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(201).expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = await response.body.map(blog => blog.title)
    assert.strictEqual(response.body.length, testHelper.initialBlogs.length + 1)
    assert(titles.includes('Cry wars'))
})

test('likes property is missing from the request', async () => {
    const newBlog = {
        title: "Fry Wars",
        author: "Munsi Premchand",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/FryWars.html"
    }

    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(201).expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const filteredBlogs = await response.body.find(blog => blog.title === "Fry Wars")
    assert.strictEqual(filteredBlogs.likes, 0)
})

test('if title is missing, returns 400', async () => {
    const newBlog = {
        author: 'Manglesh Dabral',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/FryWars.html'
    }

    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(400)
})

test('if url is missing, returns 400', async () => {
    const newBlog = {
        title: 'Godan',
        author: 'Manglesh Dabral'
    }

    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(400)
})

test('deleting a single blog post resource', async () => {
    const blogsAtStart = await testHelper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', `Bearer ${token}`).expect(204)
    const blogsAtEnd = await testHelper.blogsInDb()
    const ids = blogsAtEnd.map(blog => blog.id)
    assert(!ids.includes(blogToDelete.id))
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
})

test('updating like of a blog', async () => {
    const blogsAtStart = await testHelper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const newBlog = {
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes + 1
    }

    await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog)

    const updatedBlog = await api.put(`/api/blogs/${blogToUpdate.id}`).set('Authorization', `Bearer ${token}`).send(newBlog)
    assert.strictEqual(updatedBlog.body.likes, newBlog.likes)
})

test('creating a blog fails with 401 if token is not provided', async () => {
    const newBlog = {
        title: 'Cry wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2
    }

    await api.post('/api/blogs').send(newBlog).expect(401)
})

after(async () => {
    await mongoose.connection.close()
})