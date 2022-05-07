let jsxLdr= e=>{
    let root=this!=window?this:document.body;
    let $=($,q)=>q=='.__'?$:$.querySelector(parse($.className,q));
    let parse=(BEM,str)=>str.replace(/((= |=|="|= ")|((^|\s)\.))((__[a-z])|__([^a-z]|$))/gi,`$2$3${BEM}$6$7`)
    root.querySelectorAll(`[jsxLdr]`).forEach(el=> {
        let $el= $.bind(null,el);
        Object.defineProperties($el,{
            toString:{value:f=>el.className},
            load:{value:js=>new Function('$',$el.js||=js).call(el,$el)},
            innerHTML:{get:f=>el.innerHTML,set:f=>setTimeout($el.load)&&(el.innerHTML=f)},
            removeChild:{value:f=>el.removeChild(f)},appendChild:{value:f=>el.appendChild(f)},
        })

        let src= el.getAttribute('jsxLdr');
        fetch(/\.[a-z]+$/i.test(src)? src: src+'.htm').then(r=>r.text()).then(str=>{
            let {0:script,2:js,index}=/<script>(\n|\r)*((.|\n|\r)*?)<\/script>/.exec(str);
            str=parse($el,str.substring(0,index)+str.substr(index+script.length))
            let [style,,css]=/<style>(\n|\r)*((.|\n|\r)*?)<\/style>/.exec(str);
            let htm=str.replace(style,'').trim();
            el.innerHTML=htm+`\n<style>\n${css}</style>`;
            console.log('compiled:');console.log(el.innerHTML);

            $el.load(js);
            console.log('loaded:');console.log(el);

            el.setAttribute('jsxState','ready');
        })
    })
}
window.addEventListener('load', jsxLdr);