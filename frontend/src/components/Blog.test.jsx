import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Blog from './Blog'

const blog = {
  id: 'randomidformyobject',
  title: 'Godan',
  author: 'Premchand',
  url: 'google.com',
  likes: 0,
  user: { username: 'aniket', name: 'Aniket Kumar Sharma' }
}

const renderBlog = (currentUser = null, handleLike = vi.fn(), handleRemove = vi.fn()) => {
  render(
    <MemoryRouter initialEntries={[`/blogs/${blog.id}`]}>
      <Routes>
        <Route
          path="/blogs/:id"
          element={<Blog blogs={[blog]} handleLike={handleLike} handleRemove={handleRemove} user={currentUser} />}
        />
      </Routes>
    </MemoryRouter>
  )
}

test('renders the blog details', () => {
  renderBlog()

  expect(screen.getByRole('heading', { name: 'Godan' })).toBeVisible()
  expect(screen.getByText('by Premchand')).toBeVisible()
  expect(screen.getByRole('link', { name: 'google.com' })).toBeVisible()
  expect(screen.getByText('0 likes')).toBeVisible()
})

test('authenticated users can like a blog', async () => {
  const user = userEvent.setup()
  const handleLike = vi.fn()

  renderBlog({ username: 'other-user' }, handleLike)

  await user.click(screen.getByRole('button', { name: 'like' }))

  expect(handleLike).toHaveBeenCalledWith({
    id: blog.id,
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: 1
  })
})

test('unauthenticated users cannot like a blog', () => {
  renderBlog()

  expect(screen.queryByRole('button', { name: 'like' })).not.toBeInTheDocument()
})

test('only the blog author can remove the blog', async () => {
  const user = userEvent.setup()
  const handleRemove = vi.fn()
  vi.spyOn(window, 'confirm').mockReturnValue(true)

  renderBlog({ username: blog.user.username }, vi.fn(), handleRemove)

  await user.click(screen.getByRole('button', { name: 'remove' }))

  expect(handleRemove).toHaveBeenCalledWith(blog)
})

test('another authenticated user cannot remove the blog', () => {
  renderBlog({ username: 'other-user' })

  expect(screen.queryByRole('button', { name: 'remove' })).not.toBeInTheDocument()
})

test('shows a fallback when the blog does not exist', () => {
  render(
    <MemoryRouter initialEntries={['/blogs/missing-id']}>
      <Routes>
        <Route path="/blogs/:id" element={<Blog blogs={[]} handleLike={vi.fn()} handleRemove={vi.fn()} user={null} />} />
      </Routes>
    </MemoryRouter>
  )

  expect(screen.getByRole('heading', { name: 'Blog not found' })).toBeVisible()
})