import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BlogList from './BlogList'

const blogs = [
  {
    id: '1',
    title: 'Lower likes',
    author: 'Author One',
    likes: 2
  },
  {
    id: '2',
    title: 'Higher likes',
    author: 'Author Two',
    likes: 8
  }
]

test('renders blogs in descending order of likes', () => {
  render(
    <MemoryRouter>
      <BlogList blogs={blogs} />
    </MemoryRouter>
  )

  const rows = screen.getAllByRole('row')

  expect(rows).toHaveLength(3)
  expect(rows[1]).toHaveTextContent('Higher likes')
  expect(rows[1]).toHaveTextContent('Author Two')
  expect(rows[1]).toHaveTextContent('8')
  expect(rows[2]).toHaveTextContent('Lower likes')
})

test('renders blog titles as links', () => {
  render(
    <MemoryRouter>
      <BlogList blogs={blogs} />
    </MemoryRouter>
  )

  expect(screen.getByRole('link', { name: 'Higher likes' })).toHaveAttribute(
    'href',
    '/blogs/2'
  )
})
