const { init } = require('../app')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Blog = require('../models/blog')

const initialUsers = async () => {
  const users = [
    {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    },
    {
      username: 'root',
      name: 'Superuser',
      password: 'salasana',
    },
  ]

  const hashedUsers = await Promise.all(
    users.map(async (user) => {
      const passwordHash = await bcrypt.hash(user.password, 10)
      return { ...user, passwordHash }
    })
  )

  return hashedUsers
}

const initialBlogs = [
  {
    title: "Veikka's blog",
    author: 'Veikka',
    url: 'http://www.blogger.com',
    likes: 123,
  },
  {
    title: 'Blog of the kings',
    author: 'King Richard',
    url: 'http://www.kings.com',
    likes: 25,
  },
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'Will remove soon',
    author: 'Removing',
    url: 'http://www.Removing.com',
    likes: 1,
  })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const getAuthToken = async (api) => {
  const response = await api.post('/api/login').send({
    username: 'root',
    password: 'salasana',
  })
  return response.body.token
}

module.exports = {
  initialUsers,
  initialBlogs,
  nonExistingId,
  usersInDb,
  blogsInDb,
  getAuthToken,
}
