var _ = require('lodash');

const dummy = blogs => {
    return 1
}

const totalLikes = blogs => {
    let likes = 0
    blogs.forEach(element => {
        likes = element.likes + likes
    });
    return likes
}

const favoriteBlog = blogs => {
    return res = blogs.length < 1 ? undefined : blogs.reduce((prev, curr) => {
        return curr.likes > prev.likes ? curr : prev
    })
}

const mostBlogs = blogs => {
    const counts = _.countBy(blogs, 'author')
    const mostBlogs = !counts ? 0 : _.maxBy(Object.entries(counts), ([author, count]) => count)

    return mostBlogs ? {
        author: mostBlogs[0],
        blogs: mostBlogs[1]
    } : undefined
}

const mostLikes = blogs => {
    const group = _.groupBy(blogs, val => val.author)
    const likes = _.map(group, (blogs, author) => ({
        author,
        likes: _.sumBy(blogs, 'likes')
    }))

    return _.maxBy(likes, 'likes')
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}