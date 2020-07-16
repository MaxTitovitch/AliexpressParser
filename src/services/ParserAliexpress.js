let fs = require('fs')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())



module.exports = class ParserAliexpress {
  constructor (initUrl) {
    this.initUrl = initUrl
    this.products = []
    debugger;
  }

  getCategories () {
    return this.products
  }

  async parse () {
    this.browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] })
    let page = await this.createPage(this.browser, this.initUrl)
    await this.startParsing(page)
    await this.browser.close()
  }

  async startParsing (page) {
    await page.goto(this.initUrl)

    if(await this.isLogin(page)) {
      await this.login(page)
      await page.waitFor(30000);
      await page.goto(this.initUrl)
    }
    await this.scrollPage(page)
    await page.waitFor(3000);
    let pageQuantity = await this.getPageQuantity(page)
    for (let i = 1; i <= pageQuantity; i++) {
      this.products = [...this.products, ...await this.parseOneItemData(page, this.initUrl + '&page=' + i)]
    }
    console.log(this.products)
  }


  async parseOneItemData (page, initUrl) {
    await page.goto(initUrl)
    await this.scrollPage(page)
    await page.waitFor(3000);

    return page.evaluate(() => {
      try {
        let arrData = [];
        document.querySelectorAll('.list-item').forEach(function (el,node, number) {
          arrData.push(el.querySelectorAll('.item-title')[0].getAttribute('href').split('?')[0].split('//').join(''))
        })
        return arrData;
      } catch (e) {
        return null
      }
    })
  }



  async createPage (browser, url) {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)
    await page.setViewport({ width: 1920, height: 926 })
    await page.goto(url)

    return page
  }

  async scrollPage (page) {
    let size = await page.evaluate(_ => document.body.scrollHeight)
    for (let i = 0; i < size; i += 100) {
      await page.evaluate(function () {
        window.scrollTo(0, window.scrollY + 100)
      })
      await page.waitFor(20)
    }
  }

  async isLogin (page) {
    return await page.evaluate(() => {
      return location.host;
    }) === 'login.aliexpress.com'
  }

  async login (page) {
    await page.evaluate(() => {
      let user = {
        login: 'd-korin1996@mail.ru',
        password: 'newitem'
      };
      document.querySelectorAll('#fm-login-id')[0].value = user.login
      document.querySelectorAll('#fm-login-password')[0].value = user.password
      document.querySelectorAll('.password-login')[0].click()
    })
  }

  async getPageQuantity (page) {
    return page.evaluate(() => {
      let text = document.querySelectorAll('.total-page')[0].innerText.split(' ')
      for (let i = 0; i < text.length; i++) {
        let number = Number(text[i]);
        if(!isNaN(number))
          return number
      }
    })
  }
}