const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
})

afterEach(async () => {
  await page.close();
})



describe('When logged in', async () => {
  beforeEach(async()=>{
    await page.login();
    await page.click('a.btn-floating');
  })
  test('can see the blog create from', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  })
  describe('and using valid input', async ()=> {
    beforeEach(async()=>{
      await page.type('.title input', 'My Title');
      await page.type('.content input', 'My Contnet');
      await page.click('form button');
    })
    test('submitting takes user to review screen', async()=>{
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries');
    })

    test('submitting a blog and saving takes user to index page', async()=> {
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');
      expect(title).toEqual('My Title');
      expect(content).toEqual('My Contnet');
    })
  })
  describe('and using invalid input', async() => {
    beforeEach(async()=> {
      await page.click('form button');
    })
    test('The form shows error message', async ()=> {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');
      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    })
  })
})

describe('When not logged in', async ()=> {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    }, 
    {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'My Title', 
        content: 'My Content'
      }
    }
  ]

  test('Blog related actions are prohibited',async ()=> {
    const results = await page.execREquests(actions);
    for (let result of results) {
      expect(result).toEqual({error: 'You must log in!'});
    }
  })

  // test('User cannot create blog post', async () => {
  //   const result = await page.post('/api/blogs', {title: 'My Title', content: 'My Content'});
  //   expect(result).toEqual({error: 'You must log in!'});
  // })
  // test('User cannot get a list of post', async()=>{
  //   const result = await page.get('/api/blogs');
  //   expect(result).toEqual({error: 'You must log in!'});
  // })
})