const axios = require("axios")
const cheerio = require("cheerio");
const fs = require('fs');

const url = "https://www.cermati.com/artikel";
const articles = []
const detail = { 'articles': articles };

async function getArticleUrl() {
	try {
        const html = await axios.get(url);
        const $ = await cheerio.load(html.data);
        const articleUrls = [];

        //Looping to get article url
        $(".list-of-articles .article-list-item").each((i, element) => {
            const path = $(element).find("a").prop('href');
            const articleUrl = url + path.slice(8, path.length);

            articleUrls.push(articleUrl);
        });

        return articleUrls;
    
  } catch (error) {
    throw error;
  }
}

async function getDetailArticle(articleUrl) {
  try {
        const html = await axios.get(articleUrl);
        const $ = await cheerio.load(html.data);

        const title = $(".post-content .post-title").text().trim();
        const author = $(".post-content .post-info .post-author .author-name").text().trim();
        const postingDate = $(".post-content .post-info .post-date").find("span").text().trim();

        const relatedArticles = [];

        //Related Article
        $(".margin-bottom-30 .panel-items-list").first().find("li").each((index, element) => {
            const path = $(element).find("a").attr('href');
            const relatedArticleUrl = url + path.slice(8, path.length);
            const relatedArticleTitle = $(element).find("a .item-title").text().trim()
            
            relatedArticles.push({
            'url': relatedArticleUrl,
            'title': relatedArticleTitle
            });
        });

        articles.push({
            'url': articleUrl,
            'title': title,
            'author': author,
            'postingDate': postingDate,
            'relatedArticles': relatedArticles
            
        });

        saveResult(detail);

  } catch (error) {
    throw error;
  }
}

const saveResult = (data) => {
  const dataJson = JSON.stringify(data);
  fs.writeFileSync('solution.json', dataJson);
}

getArticleUrl()
.then(function(articleUrls){
  for (var i = 0; i < articleUrls.length; i++){
    getDetailArticle(articleUrls[i]);
  }
})

