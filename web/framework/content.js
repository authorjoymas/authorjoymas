
// Templates Functions
function CreateContent(html, numOfCols) {
    let column = document.createElement("section");
    let width = 100 / numOfCols - 5;
    column.classList.add("row");
    column.style.width = `${width}%`;
    column.innerHTML = html;
    return column;
}

function parseDirectoryListing(htmlContent, contentPath) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const fileListElement = doc.querySelectorAll('#files a .name');
    const fileList = Array.from(fileListElement).filter(span => { 
       return span.textContent.slice((Math.max(0, span.textContent.lastIndexOf(".")) || Infinity) + 1) != "";
    }).map(span => `${window.location.origin}${contentPath}/${span.textContent}`);

    return fileList;
}


// Main Start Here
let contentPath = document.currentScript.getAttribute('contentPath');

let oldelem = document.querySelector("script#content");
let newelem = document.createElement("main");
oldelem.parentNode.replaceChild(newelem,oldelem);

// assuming that its hosting on github or localhost,This is github pages specific and would need to be changed if moving to another platform
let [url, mustParse] = window.location.hostname == ("localhost" || "127.0.0.1") ? [window.location.origin,true] : ["https://api.github.com/repos/authorjoymas/authorjoymas/contents/", false];

fetch(`${url}${contentPath}`).then(res => {
    if( res.status != 200) {
        return Promise.reject(res.status);
    }
    return  res.text();
   
}).then(text => {
    let list;
    if(mustParse) {
        list = parseDirectoryListing(text, contentPath);
    }else {
        let manifest = JSON.parse(text);
        if(!Array.isArray(manifest))
        {
            manifest = [manifest];
        }
        list = manifest.map(item => `/${item.path}`);
    }
    (async () => {
    for (let item of list) {
        let res = await fetch(item);
        let text = await res.text();
        let contentCols = text.split('---');
        let numOfCols = contentCols.length;
        let classCols = numOfCols > 1 ? (numOfCols > 3 ? "multi-column" : "few-column") : "single-column";
        let article = document.createElement("article");
        article.classList.add("column", classCols);
        let isFirst = true;
        for(content of contentCols) {

            if(!isFirst) {
                let div = document.createElement("div");
                div.classList.add("divider");
                article.appendChild(div);
            } else {
                isFirst = false;
            }

            let html = marked.parse(content);
            let column = CreateContent(html, numOfCols);
            article.appendChild(column);
        }
        newelem.appendChild(article);
    }
})();
}, error => console.log(`Content Could not be retrieved, server responded with ${error}`));



