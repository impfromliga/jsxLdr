let jsxLdr= async e=>{
    let root=this!=window?this:document.body;
    let $=($,q)=>q=='.__'?$:$.querySelector(parse($.className,q));
    let parse=(BEM,str)=>str.replace(/((= |=|="|= ")|((^|\s)\.))((__[a-z])|__([^a-z]|$))/gi,`$2$3${BEM}$6$7`)
    let el,jsxs= [].slice.call(root.querySelectorAll(`[jsxLdr]`));
    while(el=jsxs.pop())await(async el=>{
        console.log(`start compiling: ${el.className}`);
        let $el= $.bind(null,el);
        Object.defineProperties($el,{
            toString:{value:f=>el.className},
            load:{value:js=>new Function('$',$el.js||=js).call(el,$el)},
            innerHTML:{get:f=>el.innerHTML,set:f=>setTimeout($el.load)&&(el.innerHTML=f)},
            removeChild:{value:f=>el.removeChild(f)},
            appendChild:{value:function(add){
                if(typeof add!='string')return el.appendChild(add);
                let t= Object.assign(document.createElement('div'),{innerHTML:add}).children;
                return t.length==1? this.appendChild(t[0]): [].slice.call(t).map(ch=>this.appendChild(ch));
            }},
        })

        let src= el.getAttribute('jsxLdr');
        await fetch(src=(/\.[a-z]+$/i.test(src)? src: src+'.htm')).then(r=>r.text()).then(str=>{
            let {0:script,2:js,index}=/<script>(\n|\r)*((.|\n|\r)*?)<\/script>/.exec(str);
            str=parse($el,str.substring(0,index)+str.substr(index+script.length))
            let [style,,css]=/<style>(\n|\r)*((.|\n|\r)*?)<\/style>/.exec(str);
            let htm=str.replace(style,'').trim();
            el.innerHTML=htm+`\n<style>\n${css}</style>`;
            console.log(`compiled: ${src}`);console.log(el.innerHTML);

            //nested:
            let nested= [].slice.call(el.querySelectorAll(`[jsxLdr]`));
            console.log({nested})
            if(nested)jsxs.push(...nested);

            $el.load(js);
            console.log(`loaded as: .${$el}`);console.log(el);

            el.setAttribute('jsxState','ready');
        })
        console.log({jsxs})
    })(el)
}
window.addEventListener('load', jsxLdr);