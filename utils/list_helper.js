const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog, blogs[0])
}

const mostBlogs = (blogs) => {
  const authors = _.groupBy(blogs, 'author');
  const author = _.maxBy(Object.keys(authors), (author) => authors[author].length);
  return { author, blogs: authors[author].length }
}

const mostLikes = (blogs) => {
  const authors = _.groupBy(blogs, 'author')
  const author = _.maxBy(Object.keys(authors), (author) => _.sumBy(authors[author], 'likes'))
  return { author, likes: _.sumBy(authors[author], 'likes') }
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}