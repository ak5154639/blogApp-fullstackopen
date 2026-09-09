const { test, expect, beforeEach, describe } = require('@playwright/test')
const { resetDb, createNewUser, loginWith, createBlog, testUser, testUser2 } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('Login form is shown', async ({ page }) => {
    const loginFormLocator = page.getByText('log in to application')
    const usernameLocator = page.getByLabel('username')
    const passwordLocator = page.getByLabel('password')
    const loginButton = page.getByRole('button', {'name': 'login'})
    
    await expect(loginFormLocator).toBeVisible()
    await expect(usernameLocator).toBeVisible()
    await expect(usernameLocator).toBeEditable()
    await expect(passwordLocator).toBeVisible()
    await expect(passwordLocator).toBeEditable()
    await expect(loginButton).toBeVisible()
  })
})

describe('User Login', () => {
  beforeEach(async ({ page, request }) => {
    await resetDb(request)
    await createNewUser(request, testUser)
    await page.goto('/login')
  })

  test('user can login', async ({ page }) => {
    await loginWith(page, testUser.username, testUser.password)
    await expect(page.getByText(`${testUser.username} logged in`,).first()).toBeVisible()
  })

  test('login failed with wrong credentials', async ({ page }) => {
    await loginWith(page, testUser.username, 'wrong')
    await expect(page.getByText('invalid username or password')).toBeVisible()
  })
})

describe('When logged in', () => {
  beforeEach(async ({ page, request }) => {
    await resetDb(request)
    await createNewUser(request, testUser)
    await page.goto('/login')
    await loginWith(page, testUser.username, testUser.password)
  })

  test('a new blog can be created', async ({ page }) => {
    await createBlog(page, {title: 'Godan', author: 'premchand', url: 'google.com'})

    await expect(page.getByText('Godan by premchand', { 'exact': true })).toBeVisible()
  })

  test('the blog can be liked', async ({ page }) => {
    await createBlog(page, {title: 'Karambhoomi', author: 'premchand', url: 'google.com'})

    await page.getByRole('link', { 'name': 'Karambhoomi by premchand' }).click()
    
    const likeText = await page.getByText('likes', { 'exact': false }).textContent()
    const prevLikes = Number(likeText.match(/\d+/)[0])

    await page.getByRole('button', { 'name': 'like' }).click()
    await expect(page.getByText(`${prevLikes + 1} likes`, { 'exact': false })).toBeVisible()
  })
  
  test('the user who added the blog can delete the blog', async ({ page }) => {
    await createBlog(page, {title: 'Karambhoomi', author: 'premchand', url: 'google.com'})

    await page.getByRole('link', { 'name': 'Karambhoomi by premchand' }).click()
    
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toBe('Remove blog Karambhoomi by premchand')
      
      await dialog.accept()
    })
    
    await page.getByRole('button', { 'name': 'remove' }).click()

    await expect(page.getByText('blog Karambhoomi by premchand deleted')).toBeVisible()
    await expect(page.getByText('Karambhoomi', { 'exact': true })).not.toBeAttached()
  })
})

describe('When user is logged in with different users', () => {
  beforeEach(async ({ page, request }) => {
    // Resetting DB
    await resetDb(request)

    // Creating a default test user
    await createNewUser(request, testUser)

    // Creating another test user
    await createNewUser(request, testUser2)

    await page.goto('/login')

    // Login with first test user
    await loginWith(page, testUser.username, testUser.password)
    // First USer created a blog
    await createBlog(page, {title: 'Godan', author: 'premchand', url: 'google.com'})

    // Logging out first user
    await page.getByRole('button', { 'name': 'logout' }).click()

    // Clicking Login button again
    await page.getByRole('link', { 'name': 'login' }).click()

    // Login with another test user
    await loginWith(page, testUser2.username, testUser2.password)

  })
  
  test('user who didn\'t created blog couldn\'t see delete button', async ({ page }) => {
    await page.getByRole('link', { 'name': 'Godan by premchand' }).click()
    // Make sure delete button not visible for this user
    await expect(page.getByRole('button', { 'name': 'delete' })).not.toBeVisible()
  })
})

describe('when multiple blogs are there', () => {
  beforeEach(async ({ page, request }) => {
    // Resetting DB
    await resetDb(request)

    // Creating a default test user
    await createNewUser(request, testUser)

    // Creating another test user
    await createNewUser(request, testUser2)

    await page.goto('/login')

    // Login and create one blog
    await loginWith(page, testUser.username, testUser.password)
    await createBlog(page, {title: 'Godan', author: 'premchand', url: 'google.com'})
    await createBlog(page, {title: 'Madan', author: 'chandhu', url: 'face.com'})
    await createBlog(page, {title: 'Karmbhoomi', author: 'munshi', url: 'munshi.com'})

    // like randomly 10 posts
    const likeBlog = async (blogName, amount) => {
      for (let index = 0; index < amount; index++) {
        await page.getByRole('link', { name: blogName }).click()
        await page.getByRole('button', { name: 'like' }).click()
        await page.getByRole('link', { name: 'blogs' }).click()
      }
    }
    await likeBlog('Godan by premchand', 3)
    await likeBlog('Madan by chandhu', 2)
    await likeBlog('Karmbhoomi by munshi', 1)
  })

  test('blogs are arranged in the order according to the likes', async ({ page }) => {
    const likeTexts = page.getByText('likes')
    const likes = []
    for (let i = 0; i < await likeTexts.count(); i++) {
      const likeText = await likes.nth(i).textContent()
      const like = Number(likeText.match(/\d+/)[0])
      likes.push(like)
    }

    const sortedLikes = [...likes].sort((a,b) => b - a)

    expect(likes).toEqual(sortedLikes)
  })
})