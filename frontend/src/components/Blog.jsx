import { useParams, useNavigate } from 'react-router-dom'
import { styled } from 'styled-components'

const BlogCard = styled.div`
  padding: 1.5em;
  margin-bottom: 1.5em;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`

const BlogTitle = styled.h2`
  margin: 0 0 0.4em 0;
  font-size: 1.6rem;
  font-weight: 500;
`

const BlogAuthor = styled.div`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1em;
`

const BlogUrl = styled.a`
  display: block;
  margin-bottom: 1em;
  color: #1976d2;
`

const BlogLikes = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8em;
`

const ActionButton = styled.button`
  padding: 0.5em 1.2em;
  border: 1px solid #1976d2;
  border-radius: 4px;
  background: white;
  color: #1976d2;
  font-size: 1rem;
  cursor: pointer;
  text-transform: uppercase;

  &:hover {
    background: #e3f2fd;
  }
`

const RemoveButton = styled(ActionButton)`
  border-color: #e53935;
  color: #e53935;

  &:hover {
    background: #ffebee;
  }
`

const Blog = ({ blogs, handleLike, handleRemove, user }) => {
  const id = useParams().id
  const navigate = useNavigate()
  const blog = blogs.find(n => n.id === id)

  if (!blog) {
    return (
      <BlogCard>
        <BlogTitle>Blog not found</BlogTitle>
        <ActionButton onClick={() => navigate('/')}>
          back to blogs
        </ActionButton>
      </BlogCard>
    )
  }

  const like = async () => {
    handleLike({
      id: blog.id,
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes + 1
    })
  }

  const remove = async () => {
    const userResponse = window.confirm(`Remove blog ${blog.title} by ${blog.author}`)
    if (userResponse) {
      handleRemove(blog)
      navigate('/')
    }
  }

  return (
    <BlogCard>
      <BlogTitle>{blog.title}</BlogTitle>
      <BlogAuthor>by {blog.author}</BlogAuthor>
      <BlogUrl href={blog.url}>{blog.url}</BlogUrl>
      {blog.user && (<BlogAuthor>Added by {blog.user.name}</BlogAuthor>)}
      <BlogLikes>
        <span>{blog.likes} likes</span>

        {user && (
          <ActionButton onClick={like}>
            like
          </ActionButton>
        )}

        {blog.user && user &&
          blog.user.username === user.username && (
            <RemoveButton onClick={remove}>
              remove
            </RemoveButton>
          )
        }
      </BlogLikes>
    </BlogCard>
  )
}

export default Blog