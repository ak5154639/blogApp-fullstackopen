import { useState, useEffect } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import { Container } from '@mui/material'

import {
  BrowserRouter as Router,
  Routes, Route, Link, useNavigate, Navigate
} from 'react-router-dom'

import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import BlogList from './components/BlogList'
import Blog from './components/Blog'
import styled from 'styled-components'

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  background: #2196F3;
  padding: 1em;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`

const NavigationLink = styled(Link)`
  font-size: 2rem;
  text-decoration: none;
  color: inherit;
  margin-left: 1em;
  text-transform: uppercase;
  font-family: inherit;
  display: flex;
  align-items: center;
`

const LogoutButtonStyled = styled.button`
  font-size: 2rem;
  color: inherit;
  margin-left: 1em;
  text-transform: uppercase;
  border: 0;
  background: none;
  cursor: pointer;
  font-family: inherit;
`

const LinkSet = styled.div`
  display: flex;
  justify-content: space-between;
`

const LogoutButton = ({ handleLogout }) => {
  const navigate = useNavigate()

  const logout = () => {
    handleLogout()
    navigate('/')
  }

  return <LogoutButtonStyled onClick={logout}>logout</LogoutButtonStyled>
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState(null)

  const handleLogin = async event => {
    event.preventDefault()
    console.log('logging in with ', username, password)
    try {
      const user = await loginService.login({ username, password })

      window.localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      blogService.setToken(user.token)
      setUsername('')
      setPassword('')
      setMessage({ type: 'success', text: `${user.username} logged in` })
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      console.log('Err: ', error)
      setMessage({ type: 'error', text: error.response?.data?.error || error.message })
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    }
  }

  const handleLogout = async () => {
    window.localStorage.removeItem('user')
    blogService.setToken(null)
    setUser(null)
    setMessage({ type: 'success', text: 'logged out successfully' })
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const handleCreate = async (newBlog) => {
    try {
      const blog = await blogService.create(newBlog)
      setMessage({ type: 'success', text: `a new blog ${blog.title} by ${blog.author} added` })
      setBlogs([...blogs, blog])
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    }
  }

  const handleLike = async updatedBlog => {
    try {
      const returnedBlog = await blogService.update(updatedBlog)
      setMessage({ type: 'success', text: `blog ${returnedBlog.title} liked by ${user.username}` })
      setBlogs(blogs.map(blog => blog.id === returnedBlog.id ? returnedBlog : blog))
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    }
  }

  const handleRemove = async blogToDelete => {
    try {
      await blogService.remove(blogToDelete)
      setMessage({ type: 'success', text: `blog ${blogToDelete.title} by ${blogToDelete.author} deleted` })
      setBlogs(blogs.filter(blog => blog.id !== blogToDelete.id))
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    }
  }

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('user')
    if (loggedUser) {
      const user = JSON.parse(loggedUser)
      setUser(user)
      blogService.setToken(user.token)
    }

    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])


  return (
    <Container>
      <Router>
        <Navigation>
          <h1>Blog App</h1>
          <LinkSet>
            <NavigationLink to="/">blogs</NavigationLink>
            {user && <NavigationLink to="/create">new blog</NavigationLink>}
            {user ? <LogoutButton handleLogout={handleLogout} /> : <NavigationLink to="/login">login</NavigationLink>}        
          </LinkSet>
        </Navigation>
        <Notification notification={message} />

        <Routes>
          <Route path="/blogs/:id" element={<Blog blogs={blogs} handleLike={handleLike} handleRemove={handleRemove} user={user} />} />
          <Route path="create" element={!user ? <Navigate to="/" replace /> : <BlogForm createBlog={handleCreate} />} />
          <Route
            path="/login"
            element={
              user
                ? <Navigate to="/" replace />
                : <LoginForm
                    username={username}
                    setUsername={setUsername}
                    password={password}
                    setPassword={setPassword}
                    handleLogin={handleLogin}
                  />
            }
          />
          <Route path='/' element={<BlogList blogs={blogs} handleLike={handleLike} handleRemove={handleRemove} user={user} />} />
        </Routes>
      </Router>
    </Container>
  )
}

export default App