const parse=(BEM,str)=>str.replace(/((= |=|="|= ")|((^|\s)\.))((__[a-z])|__([^a-z]|$))/gi,`$2$3${BEM}$6$7`)
const querier=(el,q)=>q=='.__'?el:el.querySelector(parse(el.className,q));

function jsxldr($pa){
    const pa=this!=window?this:document.body;
    let jsxs=[].slice.call(pa.querySelectorAll(`[jsxldr]`));
    console.log({pa,$pa:''+$pa,evals:$pa&&Object.keys($pa),jsxs})
    return jsxs.map(async el=>{
        let href= el.getAttribute('jsxldr');
        el.removeAttribute('jsxldr');

        console.log(`start compiling: ${el.className}`);
        const _children={};
        const $= Object.defineProperties(querier.bind(null,el),{
            toString:{value:f=>el.className},
            removeChild:{value:f=>el.removeChild(f)},
            appendChild:{value:function(add){
                if(typeof add!='string')return el.appendChild(add);
                let t= Object.assign(document.createElement('div'),{innerHTML:add}).children;
                let ret= t.length==1? this.appendChild(t[0]): [].slice.call(t).map(ch=>this.appendChild(ch));
                jsxldr.call(el,$); //dynamic nested
                return ret;
            }},
            parent:{get(){return pa}},            //TODO: JSX scope pa
            children:{get(){return q=>{
                console.log({q,_children,val:_children[q]})
                return _children[q]
                }}},   //TODO: JSX scope children
        })

        await fetch(href=(/\.[a-z]+$/i.test(href)? href: href+'.htm')).then(r=>r.text()).then(async str=>{
            //console.log('fetched',href); //TODO: cache
            let {0:script,2:js,index}=/<script>(\n|\r)*((.|\n|\r)*?)<\/script>/.exec(str)??{0:0,2:0,index:0};
            //evals js
            new Function('$',js).call(el,$)
            console.log(`evals: ${Object.keys($)}`, el);

            str=parse($,str.substring(0,index)+str.substr(index+script.length))
            let [style,,css]=/<style>(\n|\r)*((.|\n|\r)*?)<\/style>/.exec(str)??[0,0,0];
            let htm=str.replace(style,'').trim();
            el.innerHTML+=htm+`\n<style>\n${css}</style>`;
            //console.log(`compiled: ${href}`);console.log(el.innerHTML);

            //bindlate:
            let bindlate=[].slice.call(el.querySelectorAll(`[_click]`));
            console.log({bindlate});

            //load nested:
            (await Promise.all(jsxldr.call(el,$)) ).forEach(([ch,$ch])=>_children['#'+$ch]=[ch,$ch])
            console.log( el, 'loaded children', {_children});

            //binds:
            bindlate.forEach(ch=>{
                let[v,q,...bnd]=/([.#$][^.#$]*)([.#$][^.#$]*)?([.#$][^.#$]*)?/
                    .exec(ch.getAttribute('_click'))??[];
                console.log(Object.keys($));
                let $ch=$;
                for(;v=bnd.shift();q=v){
                    console.log(`binding access child ${q}`, $ch.children);
                    [ch,$ch]=$ch.children(q)
                }
                console.log(`binding .${ch.className}.onclick to ${q}`)
                console.log(ch, Object.keys($), $ch[q.slice(1)]);
                if(!$ch[q.slice(1)])
                    throw new Error("empty bind")
                el.onclick=$ch[q.slice(1)];
                console.log(Object.keys($ch));
            })
        })
        return[el,$];
    })
}
window.addEventListener('load', f=>jsxldr());