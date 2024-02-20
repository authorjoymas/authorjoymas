fetch('/web/components/nav.html')
.then(res => res.text())
.then(text => { 
    let oldelem = document.querySelector("script#navbar");
    let newelem = document.createElement("nav");
    newelem.innerHTML = text;
    oldelem.parentNode.replaceChild(newelem,oldelem);

    let a = document.getElementsByTagName('a');
    for (let idx= 0; idx < a.length; ++idx){
        if (a[idx].href == window.location.href) {
            a[idx].firstChild.classList.add('active-link');
        }
    }
})