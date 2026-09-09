import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextField, Button } from '@mui/material'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const navigate = useNavigate()

  const handleCreate = async (event) => {
    event.preventDefault()
    createBlog({ title, author, url })
    navigate('/')
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={handleCreate}>
        <div>
          <TextField label='title' value={title} onChange={({ target }) => setTitle(target.value)} variant='outlined' required='true' style={{ marginTop: 10 }} />
        </div>
        <div>
          <TextField label='author' value={author} onChange={({ target }) => setAuthor(target.value)} variant='outlined' required='true' style={{ marginTop: 10 }} />
        </div>
        <div>
          <TextField label='url' value={url} onChange={({ target }) => setUrl(target.value)} variant='outlined' required='true' style={{ marginTop: 10 }} />
        </div>
        <Button type='submit' variant='contained' style={{ marginTop: 10 }}>create</Button>
      </form>
    </div>
  )
}

export default BlogForm