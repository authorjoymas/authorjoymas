fetch('/web/components/nav.html')
.then(res => res.text())
.then(html => { 

    fetch('/content/color.txt')
    .then(res => res.text())
    .then(text => { 
        const colors = text.split('\n').filter(line => line.trim() !== "").reduce((acc, line) => {
            const [key, value] = line.split(':');
            acc[key.trim()] = value.trim();
            return acc;
        }, {});

        let oldelem = document.querySelector("script#navbar");
        let newelem = document.createElement("nav");
        newelem.innerHTML = html;
        oldelem.parentNode.replaceChild(newelem,oldelem);
    
        let a = document.getElementsByTagName('a');
        for (let idx= 0; idx < a.length; ++idx){
            let name = a[idx].firstChild.id;
            if(name == undefined) continue;
            if (a[idx].href == window.location.href) {
                a[idx].firstChild.classList.add('active-link');
                document.querySelector(":root").style.setProperty('--base-color', colors[name] );
            } else {
                a[idx].firstChild.style.background = colors[name];
            }
            
        }

    })

   

    
})