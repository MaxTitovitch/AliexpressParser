import "reflect-metadata";
let  ParserAliexpress = require('./services/ParserAliexpress');
// @ts-ignore
let fs = require('fs');

const categoryUrl = 'https://aliexpress.ru/category/202058117/men-watches.html?CatId=202058117&origin=n&spm=a2g0o.category_nav.1.102.24695d8bZLiTCi';

let runWork = async () => {
    let parser = new ParserAliexpress(categoryUrl);
    await parser.parse();
    let categories = parser.getCategories();

    fs.writeFileSync(`./DATA.json`, JSON.stringify(categories), 'utf-8');
};

runWork().then(r => r);
