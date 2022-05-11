(function(){
const parse=(BEM,str)=>str.replace(/((= |=|="|= ")|((^|\s)\.))((__[a-z])|__([^a-z]|$))/gi,`$2$3${BEM}$6$7`)
const querier=(el,q)=>q=='.__'?el:el.querySelector(parse(el.className,q));
const EVENT_TYPES=['_click','_dblclick','_change'];

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
            removeChild:{value:ch=>el.removeChild(ch)},
            appendChild:{value:function(add){
                if(typeof add!='string')return el.appendChild(add);
                let t= Object.assign(document.createElement('div'),{innerHTML:add}).children;
                let ret= t.length==1? this.appendChild(t[0]): [].slice.call(t).map(ch=>this.appendChild(ch));
                jsxldr.call(el,$); //dynamic nested
                return ret;
            }},
            parent:{get(){return $pa}},            //TODO: JSX scope pa
            children:{get(){return sel=>{
                if(!sel)return _children.slice();
                console.log({sel,_children,val:_children[sel]})
                return _children[sel]
                }}},   //TODO: JSX scope children
            toString:{value:f=>el.className},
            log:{value:(t=0)=>`${'\t'.repeat(t)}${$}:{\n${[
                    ...Object.keys(_children).map(ch => _children[ch].log(t+1)),
                    ...Object.keys($).map(k => `${'\t'.repeat(t+1)}$${k}:${$[k]}`)
                ].join(`,${'\t'.repeat(t)}\n`)
            }}`},
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

            //bindlate jobs:
            let bindlate=[].slice.call(el.querySelectorAll(EVENT_TYPES.map(e=>`[${e}]`).join(',')));
            console.log({bindlate});

            //load nested:
            (await Promise.all(jsxldr.call(el,$))).map($ch=>{
                console.log(el,'======CH', $ch, Object.keys($ch))
                _children[$ch]=$ch
            })

            console.log('loaded:', el);
            console.log($.log());

            //binds:
            bindlate.forEach(ch=>{
                EVENT_TYPES.forEach(ev=>{
                    let attr= ch.getAttribute(ev);
                    if(!attr)return;
                    let[v,sel,...bind]=/([.#$][^.#$]*)([.#$][^.#$]*)?([.#$][^.#$]*)?/.exec(attr)??[];
                    let $pa=$;
                    for(;v=bind.shift();sel=v){
                        console.log(`binding access child ${sel}`, $pa.children);
                        $pa=$pa.children(sel.slice(1))
                    }
                    [,sel,args]=/\$([^(]*)(?:\(([^)]*)\))?/.exec(sel);
                    //console.log(`binding .${ch.className}.onclick to $.${sel} of $:`, Object.keys($pa).reduce((p,k)=> Object.assign(p,{[k]:$pa[k]}), {} ))
                    if(!sel||!$pa[sel]) throw new Error("empty bind")
                    // if(args){} //TODO: bind with arguments
                    ch['on' + ev.slice(1)]=$pa[sel];//.bind(null,args);
                    console.log(`${$.log()}`);
                    })
                })
        })
        return $;
    })
}
window.addEventListener('load', f=>jsxldr())
})();