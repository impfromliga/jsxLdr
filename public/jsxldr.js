(function(){
const parse=(BEM,str)=>str.replace(/((= |=|="|= ")|((^|\s)\.))((__[a-z])|__([^a-z]|$))/gi,`$2$3${BEM}$6$7`)
const querier=(el,q)=>q=='.__'?el:el.querySelector(parse(el.className,q));
const EVENT_TYPES=['_click','_dblclick','_change'];

function jsxldr($pa){
    const pa=this!=window?this:document.body;
    return [].slice.call(pa.querySelectorAll(`[jsxldr]`)).map(async el=>{
        let href= el.getAttribute('jsxldr');
        el.removeAttribute('jsxldr');

        const _children={};
        const $= Object.defineProperties(querier.bind(null,el),{
            removeChild:{value:ch=>el.removeChild(ch)},
            appendChild:{value:function(add){
                if(typeof add!='string')return el.appendChild(add);
                let t= Object.assign(document.createElement('div'),{innerHTML:add}).children;
                let ret= t.length==1? this.appendChild(t[0]): [].slice.call(t).map(ch=>this.appendChild(ch));
                jsxldr.call(el,$); //dynamic nested
                return ret;
            }},
            parent:{get(){return $pa}},            //TODO: JSX scope pa
            children:{get(){return sel=> sel? _children[sel]: _children.slice() } },
            toString:{value:f=> el.className},
            log:{value:t=>`${'\t'.repeat(t)}${$}:{\n${[
                    ...Object.keys(_children).map(ch => _children[ch].log(-~t)),
                    ...Object.keys($).map(k => `${'\t'.repeat(-~t)}$${k}:${$[k]}`)
                ].join(`,${'\t'.repeat(t)}\n`)
            }}`},
        })

        await fetch(href=(/\.[a-z]+$/i.test(href)? href: href+'.htm')).then(r=>r.text()).then(async str=>{
            let {0:script,2:js,index}=/<script>(\n|\r)*((.|\n|\r)*?)<\/script>/.exec(str)??{0:0,2:0,index:0};
            //js set
            new Function('$',js).call(el,$)
            //HTML, CSS set
            str=parse($,str.substring(0,index)+str.substr(index+script.length))
            let [style,,css]=/<style>(\n|\r)*((.|\n|\r)*?)<\/style>/.exec(str)??[0,0,0];
            let htm=str.replace(style,'').trim();
            el.innerHTML+=htm+`\n<style>\n${css}</style>`;
            //bind jobs:
            let bindlate=[].slice.call(el.querySelectorAll(EVENT_TYPES.map(e=>`[${e}]`).join(',')));
            //await load nested:
            (await Promise.all(jsxldr.call(el,$))).map($ch=>_children[$ch]=$ch)
            //console.log('loaded:', el); console.log($.log());
            //binds:
            bindlate.forEach(ch=>{
                EVENT_TYPES.forEach(ev=>{
                    let attr= ch.getAttribute(ev);
                    if(!attr)return;
                    let[v,sel,...bind]=/([.#$][^.#$]*)([.#$][^.#$]*)?([.#$][^.#$]*)?/.exec(attr)??[];
                    let $pa=$;
                    for(;v=bind.shift();sel=v) $pa= $pa.children(sel.slice(1) );
                    [,sel,args]=/\$([^(]*)(?:\(([^)]*)\))?/.exec(sel);
                    if(!sel||!$pa[sel]) throw new Error("empty bind")
                    ch['on' + ev.slice(1)]=$pa[sel];
                })
            })
        })
        return $;
    })
}
window.addEventListener('load', f=>jsxldr())
})();