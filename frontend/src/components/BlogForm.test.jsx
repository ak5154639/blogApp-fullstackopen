import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

test('the form calls the event handler it received as props with the right details when a new blog is created', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route
          path="/login"
          element={
            <BlogForm
              createBlog={createBlog}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )
  
  const title = screen.getAllByLabelText('title')
  const author = screen.getAllByLabelText('author')
  const url = screen.getAllByLabelText('url')
  const createButton = screen.getByText('create')

  await user.type(title[0], 'godan')
  await user.type(author[0], 'premchand')
  await user.type(url[0], 'google.com')
  await user.click(createButton)
  const formdata = createBlog.mock.calls[0][0]
  
  expect(formdata.title).toBe('godan')
  expect(formdata.author).toBe('premchand')
  expect(formdata.url).toBe('google.com')
})