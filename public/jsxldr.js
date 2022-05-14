(function(){
const parse=(BEM,str)=>str.replace(/((= |=|="|= ")|((^|\s)\.))((__[a-z])|__([^a-z]|$))/gi,`$2$3${BEM}$6$7`)
    .replace(/\[((\d+)n|n(\d+))(\+\d+)?\]/g,`:nth-of-type($2$3n$4)`) //shortcut for :nth-of-type(An+B) by just [An+B] (or [nA+B] //linter fine form)
    .replace(/\[((\d+)n|n(\d+))-(\d+)?\]/g,`:nth-last-of-type($2$3n+$4)`) //same for :nth-last-of-type(An+B) by [An-B]/[nA-B] (B must exist even if 0)
const EVENT_TYPES=['_click','_dblclick','_change'];

function jsxldr($pa, $pa_children){
    const pa=this!=window?this:document.body;
    return [].slice.call(pa.querySelectorAll(`[_class]`)).map(async el=>{
        let jsxldrAttr= el.getAttribute('_class');
        let[,jsxClass,href,ext]=/(?:([^:]*):)?([^:]+?)(\.[^.]*)?$/.exec(jsxldrAttr)??[]
        jsxClass??=href; href+=ext??='.htm';
        if(!href || !jsxClass || /\./.test(jsxClass))return;
        el.removeAttribute('_class'); el.classList.add(jsxClass);
        const _children={};
        const $= Object.defineProperties(
            q=>{
                if(q===undefined) return jsxldr.call(el,$,_children) //shortcut $() for refresh this
                let[sel,scope]=q.split(/\$(?=[^\]]*$)/)
                q= sel=='.__'?el                              //shortcut $('.__') for return this dom element
                :el.querySelector(
                    (jsxClass[0]=='>'?':scope':'')+       //shortcut for :scope> by starting with '>', without typing :scope
                    parse(jsxClass,q)                     //replace '__' pattern in class literals to this jsxClass string
                    
                    //if after all finding $(prop(.prop(.prop(...)))) resolving dom nodes to scope object prop
                )
                if(scope!=undefined){
                    
                }
                return q
            }
            ,{
            parent:{value:$pa},            //TODO: JSX scope pa
            children:{value:BEM=> BEM? _children[BEM].slice(): _children},
            toString:{value:f=> jsxClass},
            removeChild:{value:$ch=>{
                console.log(`${$}.removeChild(${$ch})`,$ch);
                if(typeof $ch=='string'){
                    let ch= $($ch);
                    if(!ch)return null
                    else{
                        let[...match]=ch.className.match(RegExp(Object.keys(_children).join('|') ));
                        console.log({match});
                        if(match.length>1)throw new Error("removeChild by ambiguous selector")
                        if(match=match[0]){
                            $ch = _children[match].find($ch => $ch('.__') === ch);
                            if (!$ch) return null;
                            let i = _children[$ch].indexOf($ch);
                            _children[$ch].splice(i,1);
                        }
                        return el.removeChild(ch);
                    }
                }else if(typeof $ch=='function'){
                    let i = _children[$ch].indexOf($ch);
                    if(!~i)return null;
                    el.removeChild($ch('.__'));
                    return _children[$ch].splice(i,1)[0];
                }else return null
            }},
            tree:{value:(t,i)=>`${'\t'.repeat(t)}${$}[${i|0}]:{\n${[
                    ...Object.keys($).map(k => `${'\t'.repeat(-~t)}$${k}:${$[k]}`),
                    ...Object.keys(_children).map(chs =>
                        _children[chs].map((ch,i) => ch.tree(-~t,i))
                            .join(`,${'\t'.repeat(t)}\n`) )
                ].join(`,${'\t'.repeat(t)}\n`)
            }}`},
        })
        if($pa_children)$pa_children[$]=($pa_children[$]??[]).concat($)

        await fetch(href).then(r=>r.text()).then(async str=>{
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
            await Promise.all(jsxldr.call(el,$,_children))
            //binds:
            bindlate.forEach(ch=>{
                EVENT_TYPES.forEach(ev=>{
                    let attr= ch.getAttribute(ev);
                    if(!attr)return;
                    let[v,sel,...bind]=/([.#$][^.#$]*)([.#$][^.#$]*)?([.#$][^.#$]*)?/.exec(attr)??[];
                    let $pa=$;
                    for(;v=bind.shift();sel=v) $pa= $pa.children(sel.slice(1) )[0];
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