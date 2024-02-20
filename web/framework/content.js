

let contentPath = document.currentScript.getAttribute('contentPath');

fetch('/web/components/two-column.html')
.then(res => res.text())
.then(text => { 
    let oldelem = document.querySelector("script#content");
    let newelem = document.createElement("main");
    newelem.innerHTML = text;
    oldelem.parentNode.replaceChild(newelem,oldelem);

    fetch(contentPath).then(res => res.text())
    .then(text => { 
        let columns = text.split("---");
        let left = marked.parse(columns[0]);
        let right = marked.parse(columns[1]);

        newelem.firstChild.childNodes[1].innerHTML = left;
        newelem.firstChild.childNodes[5].innerHTML = right;
    });
});