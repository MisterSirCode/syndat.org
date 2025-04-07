const button = document.querySelector('.exportButton');
const article = document.querySelector('.materialArticle');
const output = document.querySelector('.formattedArticle');

console.log(button, article, output);

article.addEventListener('input', () => {
    let content = article.value;
    content = content.replace('\n', '\\n');
    output.value = content;
});