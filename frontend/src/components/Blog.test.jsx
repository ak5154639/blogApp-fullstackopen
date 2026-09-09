import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Blog from './Blog'

const blog = {
  id: "randomidformyobject",
  title: "Godan",
  author: "Premchand",
  url: "google.com",
  likes: 0,
  user: {username:'aniket'}
}

test('checks that the component displaying a blog renders the blog\'s title and author, but does not render its URL or number of likes by default', () => {

  render(
    <MemoryRouter initialEntries={['/blogs/randomidformyobject']}>
      <Routes>
        <Route
          path="/blogs/:id"
          element={
            <Blog
              blogs={[blog]}
              handleLike={() => {}}
              handleRemove={() => {}}
              user={null}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )

  const name = screen.getByText('Godan')
  const title = screen.getByText('Premchand')
  const url = screen.getByText('google.com')
  const likes = screen.getByText('likes 0')

  expect(name).toBeVisible()
  expect(title).toBeVisible()
  expect(url).not.toBeVisible()
  expect(likes).not.toBeVisible()
})

test('checks that the blog\'s URL and number of likes are shown when the button controlling the shown details has been clicked', async () => {

  render(
    <MemoryRouter initialEntries={['/blogs/randomidformyobject']}>
      <Routes>
        <Route
          path="/blogs/:id"
          element={
            <Blog
              blogs={[blog]}
              handleLike={() => {}}
              handleRemove={() => {}}
              user={null}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )

  const user = userEvent.setup()

  const toggle = screen.getByText('view')
  
  await user.click(toggle)
  
  expect(screen.getByText('google.com')).toBeVisible()
  expect(screen.getByText('likes 0')).toBeVisible()
})

test('un authenticate users will not see option to like', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/blogs/randomidformyobject']}>
      <Routes>
        <Route
          path="/blogs/:id"
          element={
            <Blog
              blogs={[blog]}
              handleLike={() => {}}
              handleRemove={() => {}}
              user={null}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )  
  
  const viewButton = screen.getByRole('button', { name: 'view' })
  await user.click(viewButton)
  const likeButton = screen.queryByRole('button', { name: 'like' })

  expect(likeButton).not.toBeInTheDocument()
})

test('if authenticated user clicks like twice should two mock calls of handleLike', async () => {
  const mockLike = vi.fn()

  render(
    <MemoryRouter initialEntries={['/blogs/randomidformyobject']}>
      <Routes>
        <Route
          path="/blogs/:id"
          element={
            <Blog
              blogs={[blog]}
              handleLike={mockLike}
              handleRemove={() => {}}
              user={{username: 'samar'}}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )

  const user = userEvent.setup()
  
  const viewButton = screen.getByRole('button', { name: 'view' })
  await user.click(viewButton)
  
  const likeButton = screen.getByRole('button', { name: 'like' })
  expect(likeButton).toBeVisible()
  
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockLike.mock.calls).toHaveLength(2)
})

test('if authenticated user, but not author of will not see delete', async () => {
  const mockRemove = vi.fn()
  render(
    <MemoryRouter initialEntries={['/blogs/randomidformyobject']}>
      <Routes>
        <Route
          path="/blogs/:id"
          element={
            <Blog
              blogs={[blog]}
              handleLike={() => {}}
              handleRemove={() => {}}
              user={{username: 'samar'}}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )

  const user = userEvent.setup()
  
  const viewButton = screen.getByRole('button', { name: 'view' })
  await user.click(viewButton)

  const deleteButton = screen.queryByRole('button', { name: 'delete' })
  expect(deleteButton).not.toBeInTheDocument()
})

test('if authenticated user also author of blog can delete', async () => {
  const mockRemove = vi.fn()
  render(
    <MemoryRouter initialEntries={['/blogs/randomidformyobject']}>
      <Routes>
        <Route
          path="/blogs/:id"
          element={
            <Blog
              blogs={[blog]}
              handleLike={() => {}}
              handleRemove={mockRemove}
              user={{username: 'aniket'}}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )

  const user = userEvent.setup()
  
  const viewButton = screen.getByRole('button', { name: 'view' })
  await user.click(viewButton)

  const deleteButton = screen.getByRole('button', { name: 'delete' })
  expect(deleteButton).toBeVisible()
})