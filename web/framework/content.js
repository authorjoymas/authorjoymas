
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
let [url, mustParse, devMode] = (window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1") ? [window.location.origin,true, true] : ["https://api.github.com/repos/authorjoymas/authorjoymas/contents/", false, false];

(async () => {
    let text = undefined;
    if(devMode || sessionStorage.getItem(contentPath) == undefined) {
        let response = await fetch(`${url}${contentPath}`);
        if(response.status == 200) {
        text = await response.text();
        }
    }

let list;
if(text != undefined) {
    
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
  
    list = list.filter(file => { return file.split(".")[file.split(".").length-1] == "md"});
    sessionStorage.setItem(contentPath, list);
} else {
    list = sessionStorage.getItem(contentPath);
}

console.log(list);
if(list != undefined) {
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
}
})();




