(function(){
let nextId=0;
const map= {};    
const parse=(BEM,str)=>str.replace(/((= |=|="|= ")|((^|\s)\.))((__[a-z])|__([^a-z]|$))/gi,`$2$3${BEM}$6$7`)
    .replace(/\[(\d*)\]/,`[0n+$1]`).replace(/\[-(\d*)\]/,`[0n-$1]`)         //option for replace [A] / [-A] to [0n+A] / [0n-A]
        .replace(/\[((\d+)n|n(\d+))(\+\d+)?\]/g,`:nth-of-type($2$3n$4)`)      //shortcut for :nth-of-type(An+B) by just [An+B] (or [nA+B] //linter fine form)
        .replace(/\[((\d+)n|n(\d+))-(\d+)?\]/g,`:nth-last-of-type($2$3n+$4)`) //same for :nth-last-of-type(An+B) by [An-B]/[nA-B] (B must exist even if 0)
const EVENT_TYPES=['_click','_dblclick','_change'];

function jsxldr($pa, $pa_children){
    const pa=this!=window?this:document.body;
    return [].slice.call(pa.querySelectorAll(`[_class]`)).map(async el=>{
        let _id= nextId++;
        let jsxldrAttr= el.getAttribute('_class');
        let[,jsxClass,href,ext]=/(?:([^:]*):)?([^:]+?)(\.[^.]*)?$/.exec(jsxldrAttr)??[]
        jsxClass??=href; href+=ext??='.htm';
        if(!href || !jsxClass || /\./.test(jsxClass))return;
        el.removeAttribute('_class'); el.classList.add(jsxClass); el.setAttribute('jsx',_id);
        const _children={};
        const $= Object.defineProperties(
            q=>{
                if(q===undefined) return Promise.all(jsxldr.call(el,$,_children)) //shortcut $() for refresh this
                if(q=='.__')return el;                        //shortcut $('.__') for return this dom element
                //<< TODO: comma separated multiple selectors and/or commas between argument params
                let[sel,scope]=q.split(/\$(?=[^\]]*$)/)
                console.log({sel,scope});
                if(scope!=undefined)sel+='[jsx]';
                let _el=el;
                while (sel[0] == '<') [_el, sel] = [el.parentElement, sel.slice(1)]; //switch to parent(s) querySelector
                if(sel=='[jsx]')q=[_el]
                else{
                    if (sel[0] == '>') sel = ':scope' + sel   //shortcut for :scope> by starting with '>', without typing :scope
                    q = parse(jsxClass, sel)            //replace '__' pattern in class literals to this jsxClass string

                    console.log({sel, scope});
                    console.log(`${$}.querySelectorAll(${q})`);
                    q = Array.from(_el.querySelectorAll(q))
                }
                console.log('=',q);
                if(scope!==undefined) q=q.flatMap(el=>{
                    let id=el.getAttribute('jsx');
                    jsx=map[id]
                    return jsx?[jsx]:[]
                })
                if(!scope)return q
                scope=scope.split('.')
                // let last=scope.pop(); //TODO: (args)
                //converse dom to $s
                console.log({q,'typeof q':typeof q,'q.flatMap':q.flatMap})
                q= q.map(jsx=>{
                    // resolving prop(.prop(.prop(...)))
                    for(let s of scope)jsx=jsx[s];
                    return jsx
                })
                console.log('scoped:',q)
                return q
            }
            ,{
            parent:{value:$pa},            //TODO: JSX scope pa
            children:{value:BEM=> BEM? _children[BEM].slice(): _children},
            toString:{value:f=> jsxClass},
            removeChilds:{value:$chs=>{
                console.log(`${$}.removeChilds(${$chs})`,$chs);
                if(typeof $chs=='string') $chs= $($chs);
                console.log({$chs});
                if(!$chs)return null;
                $chs=[$chs].flat()    //support for removeChilds([$ch1,$ch2,...,$chN]) same as removeChilds($ch)
                console.log({$chs});

                let dels=$chs.flatMap($ch=>{
                    if(typeof $ch=='function'){
                        console.log('removing $ch()')
                        let i = _children[$ch].indexOf($ch);
                        if(!~i)return[];
                        let id=$ch('.__').getAttribute('jsx');
                        // map[id]('>$destruct').map() //TODO: chaining
                        map[id].dismount?.()
                        delete map[id];
                        el.removeChild($ch('.__'));
                        return _children[$ch].splice(i,1)
                    }
                    console.log('removing ch',$ch, 'from parent', $ch.parentElement);
                    try{return[$ch.parentElement.removeChild($ch)]}catch{return[]}
                })
                console.log({dels});
                return dels.length?dels:null
            }},
            tree:{value:(t,i)=>`${'\t'.repeat(t)}${$}[${i|0}]:{\n${[
                    ...Object.keys($).map(k => `${'\t'.repeat(-~t)}$${k}:${$[k]}`),
                    ...Object.keys(_children).map(chs =>
                        _children[chs].map((ch,i) => ch.tree(-~t,i))
                            .join(`,${'\t'.repeat(t)}\n`) )
                ].join(`,${'\t'.repeat(t)}\n`)
            }}`},
        })
        map[_id]=$; //global id
        if($pa_children)$pa_children[$]=($pa_children[$]??[]).concat($) //append jsxs to exist children

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
            await $()
            //binds:
            bindlate.forEach(ch=>{
                EVENT_TYPES.forEach(ev=>{
                    let bind= ch.getAttribute(ev) ;
                    if(!bind || !ch.parentElement)return;
                    //TODO: by $ scope
                    [bind]=$(bind) //best 1st ?
                    if(!bind)throw new Error('empty bind')
                    console.log(`${ch}.on`+ev.slice(1),'BINDED',bind)
                    ch['on'+ev.slice(1)]=bind;
                })
            })
        })
        return $;
    })
}
window.addEventListener('load', f=>jsxldr())
})();