import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'
import { MemoryRouter } from 'react-router-dom'

test('the form calls the event handler it received as props with the right details when a new blog is created', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(
    <MemoryRouter initialEntries={['/login']}>
      <BlogForm
        createBlog={createBlog}
      />
    </MemoryRouter>
  )

  const title = screen.getByRole('textbox', { name: /^title/i })
  const author = screen.getByRole('textbox', { name: /^author/i })
  const url = screen.getByRole('textbox', { name: /^url/i })

  const createButton = screen.getByText('create')

  await user.type(title, 'godan')
  await user.type(author, 'premchand')
  await user.type(url, 'google.com')

  await user.click(createButton)

  const formdata = createBlog.mock.calls[0][0]

  expect(formdata.title).toBe('godan')
  expect(formdata.author).toBe('premchand')
  expect(formdata.url).toBe('google.com')
})