const testUser = {
  username: 'aniket',
  name: 'Aniket Kumar Sharma',
  password: 'sekret'
}

const testUser2 = {
  username: 'ramesh',
  name: 'Ramesh',
  password: 'rampass'
}

const resetDb = async (request) => {
  await request.post('/api/testing/reset')
}

const createNewUser = async (request, newUser) => {
  await request.post('/api/users', {
    data: newUser
  })
}

const loginWith = async (page, username, password) => {
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', {'name': 'login'}).click()
}

const createBlog = async (page, blog) => {
  await page.getByRole('link', { 'name': 'new blog' }).click()
  await page.getByLabel('title').fill(blog.title)
  await page.getByLabel('author').fill(blog.author)
  await page.getByLabel('url').fill(blog.url)

  await page.getByRole('button', { 'name': 'create' }).click()
}

export { resetDb, createNewUser, loginWith, createBlog, testUser, testUser2 }