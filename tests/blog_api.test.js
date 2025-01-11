const bcrypt = require('bcrypt')
const { test, after, beforeEach, describe } = require('node:test')
const Blog = require('../models/blog')
const User = require('../models/user')
const assert = require('node:assert')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
let token = ''

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
    const users = await helper.initialUsers()
    await User.insertMany(users)

    token = await helper.getAuthToken(api)

    for (const blog of helper.initialBlogs) {
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token.toString()}`)
        .send(blog)
        .expect(201)
    }
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a specific blog is within the returned notes', async () => {
    const response = await api.get('/api/blogs')

    const title = response.body.map((r) => r.title)
    assert(title.includes("Veikka's blog"))
  })

  test('blog has property: id', async () => {
    const response = await api.get('/api/blogs')

    assert(response.body[0].id)
  })
  describe('addition of a new blog', () => {
    test('a valid blog can be added ', async () => {
      const newBlog = {
        title: "Janne's blog",
        author: 'Janne',
        url: 'http://www.blogger.com',
        likes: 55,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token.toString()}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const author = blogsAtEnd.map((n) => n.author)
      assert(author.includes('Janne'))
    })

    test('if no valid token is provided, return 401 Unauthorized', async () => {
      const newBlog = {
        title: "Markkus's blog",
        author: 'Markkus',
        url: 'http://www.blogger.com',
        likes: 69,
      }

      await api.post('/api/blogs').send(newBlog).expect(401)
    })

    test('if likes property is missing, it will default to 0', async () => {
      const newBlog = {
        title: "Toivo's blog",
        author: 'Toivo',
        url: 'http://www.blogger.com',
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token.toString()}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const addedBlog = blogsAtEnd.find((blog) => blog.title === "Toivo's blog")
      assert.strictEqual(addedBlog.likes, 0)
    })

    test('if title and url properties are missing, return 400 Bad Request', async () => {
      const newBlog = {
        author: 'Kalle',
        likes: 88,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token.toString()}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })
  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token.toString()}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const titles = blogsAtEnd.map((r) => r.title)
      assert(!titles.includes(blogToDelete.title))
    })
  })

  describe('updating a blog', () => {
    test('succeeds with status code 200 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = { ...blogToUpdate, likes: 999 }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token.toString()}`)
        .send(updatedBlog)
        .expect(200)

      const blogsAtEnd = await helper.blogsInDb()
      const likes = blogsAtEnd.find((r) => r.id === blogToUpdate.id).likes

      assert.strictEqual(likes, 999)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
