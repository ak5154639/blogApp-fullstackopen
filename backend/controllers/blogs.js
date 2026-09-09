const blogsRouter = require('express').Router()
const { request } = require('express')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id).populate('user', {username: 1, name: 1, id: 1})
    console.log(blog)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})

blogsRouter.post('/', userExtractor, async (request, response) => {
    const body = request.body

    const blog = new Blog({...body, user: request.user})
    
    const result = await blog.save()

    request.user.blogs = request.user.blogs.concat(result._id)
    await request.user.save()
    
    return response.status(201).json(result)
})

blogsRouter.put('/:id', userExtractor, async (request, response) => {
    if(!request.user) {
        return response.status(401).json({error: 'not authenticated'})
    }
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true }).populate('user', { username: 1, name: 1, id: 1 })
    return response.json(updatedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    console.log(blog)
    if(blog.user.toString() !== request.user.id.toString()) {
        return response.status(401).json({error: 'not authorized'})
    }

    const result = await Blog.findByIdAndDelete(request.params.id)
    response.status(204).json(result)
})

module.exports = blogsRouter