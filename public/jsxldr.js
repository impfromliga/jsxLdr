// (function(){
let I=0
const Z= {}
const E=['_click','_dblclick','_change','_input']
const L=['MOUNT','DISMOUNT']
const P=(BEM,str)=>str
    //basicly find ='__module in BEM classNames and .__module in CSS section
    .replace(/((= |=|=\"|= \")|((^|\s)\.))((__[a-z])|__([^a-z]|$))/gi,`$2$3${BEM}$6$7`)
    //option for replace [A] / [-A] to [0n+A] / [0n-A]
    .replace(/\[(\d*)\]/,`[0n+$1]`).replace(/\[-(\d*)\]/,`[0n-$1]`)
    //shortcut for :nth-of-type(An+B) by just [An+B] (or [nA+B] linter fine form)
    .replace(/\[((\d+)n|n(\d+))(\+\d+)?\]/g,`:nth-of-type($2$3n$4)`)
    //same for :nth-last-of-type(An+B) by [An-B]/[nA-B] (B must exist even if 0)
    .replace(/\[((\d+)n|n(\d+))-(\d+)?\]/g,`:nth-last-of-type($2$3n+$4)`)
const ARG=s=>/^(?:([^<{:]*):)?([^=<]*?)(\.[^.=<]*)?(?:<([^>]*)(?:>|>?$))?(?:=(.*))?$/.exec(s)??[];

export default function jsxldr($pa, $pa_children){
    // console.log({'this':this})
    const pa=(this!=window)&&this||document.body;
    return [].slice.call(pa.querySelectorAll(`[_class]`)).map(async el=>{
        let _id= I++;
        let jsxldrAttr= el.getAttribute('_class');

        let[,jsxClass,href,ext,_arguments]=ARG(jsxldrAttr)
        ///(?:([^:(]*):)?([^:(]+?)(\.[^.(]*)?(?:([{(])(.*?)[)}]?)?$/.exec(jsxldrAttr)??[]
        _arguments=[_arguments]; //TODO: parse
        jsxClass??=href
        if(!(href+=ext??'.htm'))return console.error({jsxldrAttr}); //check & default .htm
        // is jsxClass valid className
        [,jsxClass]=/(?:^|\/)(-?[_a-zA-Z][-_a-zA-Z0-9]*)$/.exec(jsxClass)??
            [console.warn({jsxldrAttr,random:_id}),'random'+_id];
        //console.log({jsxClass, href, ext, _arguments});

        el.classList.add(jsxClass); el.setAttribute('jsx',_id);
        el.removeAttribute('_class');
        const _children={};
        const init={}, life={};
        for(let k of L)life['@'+k]=new Promise(e=>life[k]=e);

        const $= Object.defineProperties(function Q(q,...chain){
            // console.log({q,...chain})
            // $$ is $.bind(true) //used in $.removeChilds
            // $():Promise.all($childrenLoadedByRescanImmediate)
            if(q===undefined) return Promise.all(jsxldr.call(el,$,_children)) //shortcut $() for refresh this

            // if(typeof q=='object')return Object.assign(init,q);
            // if(q=='@'){chain[0]?.(_arguments);return[_arguments]}
            if(q[0]=='@') {
                if (!chain.length) return life[q]
                else if (typeof chain[0] == 'string')return life[q].then(e=>$(...chain))
            }
            // $('.__'):this    //used in css loader
            if(q=='.__')return el;                        //shortcut $('.__') for return this dom element
            //<< TODO: comma separated multiple selectors and/or commas between argument params
            let[,sel,scope]=typeof q=='string'?/^([^\$]*)(?:\$([^\]]*))?$/.exec(q):[,'','']
            // console.log({sel,scope});
            if(scope!=undefined)sel+='[jsx]';
            let _el=el;
            // $(`<) parentElement query target replace (may multiple)
            while (sel[0] == '<')//switch to parent(s) querySelector
                [_el,sel]=[_el.parentElement,sel.slice(1)]
            // $(`<$): if no selector part - just return jsx (or some jsx parent)
            const ALL=sel!=(sel=sel.replace('[]',''));//selectorAll
            if(sel=='[jsx]')q=[_el]
            // $(`<$>.ch): > shortcut for :scope> in selector
            else{
                if (sel[0] == '>') sel = ':scope' + sel   //shortcut for :scope> by starting with '>', without typing :scope
                q = P(jsxClass, sel)            //replace '__' pattern in class literals to this jsxClass string
                // console.log({sel, scope});
                // console.log(`${$}.querySelectorAll(${q})`);
                //TODO: performance of default multiple
                q=ALL?Array.from(_el.querySelectorAll(q)):(q=_el.querySelector(q))?[q]:[]
            }
            // console.log('=',q);
            // $(`<$>.ch$) resolving jsx from heap by jsx argument
            if(scope!==undefined) q=q.flatMap(el=>{
                let id=el.getAttribute('jsx');
                return Z[id]?[Z[id]]:[] //filtering missing attrs
            })
            // $(`<$>.ch$` )
            if(scope){
                // $(`<$>.ch$a.b.c(args)`)
                let[,,chProps,chLast='',bArgs,assign]=ARG(scope)
                chProps = (chProps+chLast).split('.')

                bArgs=bArgs!=undefined?[bArgs]:[]
                // let[lastProp,args]= //.exec(scope.pop()); //TODO: split [lastprop,args]
                // console.log({q,'typeof q':typeof q,'q.flatMap':q.flatMap})
                // if(bArgs){
                //     bArgs=bArgs.split(',').map(arg=>{
                //         if('{'==arg[0]) {
                //         }else if('`'==arg[0]){
                //         }else if(/^['"`]/.exec(arg)){
                //
                //         }
                //     })
                // }
                q = q.flatMap(prop => {
                    // resolving prop(.prop(.prop(...)))
                    for (let p of chProps) prop = prop?.[p];
                    //>> TODO: process [lastprop,args]
                    // https://developer.mozilla.org/ru/docs/Web/CSS/Attribute_selectors
                    if(!prop) return []
                    if(bArgs??bArgs.length){
                        prop=prop.bind(el,...bArgs)
                    }
                    // if(assign){
                    //     prop
                    // }
                    return prop ? [prop] : []
                })
            }
            // console.log('scoped:',q)
            if(!chain.length){
                //console.log('$(any):DOM|$|prop        //selector only - return sync')
                //console.log({'this':this,q});
                return ALL?q:q[0];
            }if(typeof chain[0]=='function'){//Redirection (computing)
                //.log('$(any, f() ): Promise<any>')
                return Promise.all( q.map(async prop=> {
                    //console.log({prop, 'chain[0]':chain[0]})
                    return await chain[0].call(el, prop)
                } ) )
            }else{ //if(typeof chain[0]=='string'){//chaining $ calls
                //console.log('any, `...`, ... ): Promise<any>')
                return Promise.all( q.map(async any=>   //TODO: instanse of $jsx
                    typeof any=='function'?await any(...chain):any= chain[0] //TODO: setting params
                ) )
            }//else console.error('typeof chain[0]:' + typeof chain[0])
        },{
            toString:{value:f=> jsxClass},
            removeChildren:{value:$chs=>{ //TODO: removeChildren
                    //console.log(`${$}.removeChildren(${$chs})`,$chs);
                    if(typeof $chs=='string') $chs= [$($chs)].flat(); //will return $:[]
                    //console.log({$chs});
                    if(!$chs)return null;
                    $chs=[$chs].flat()    //support for removeChildren([$ch1,$ch2,...,$chN]) same as removeChildren($ch)
                    //console.log({$chs});

                    let dels=$chs.flatMap($ch=>{
                        let ch
                        if(typeof $ch=='function') {
                            let i=_children[$ch].indexOf($ch)
                            if(!~i)return [];else _children[$ch].splice(i,1);
                            ch=$ch('.__')
                        }else if($ch instanceof Element){
                            ch=$ch;
                        }else return[];
                        let id=ch.getAttribute('jsx');
                        // map[id]('>$destruct').map()
                        // Z[id]('@dismount')
                        // L.next()
                        life.DISMOUNT() //TODO: chaining FIX
                        delete($ch=Z[id])
                        el.removeChild(ch);
                        return $ch

                        //return []
                        // console.log('removing ch',$ch, 'from parent', $ch.parentElement);
                        // try{return[$ch.parentElement.removeChild($ch)]}catch{return[]}
                    })
                    //console.log({dels});
                    return dels.length?dels:null
                }},
            //option debug method: //TODO: scope garbage collect
            // tree:{value:(t,i)=>`${'\t'.repeat(t)}${$}[${i|0}]:{\n${[
            //         ...Object.keys($).map(k => `${'\t'.repeat(-~t)}$${k}:${$[k]}`),
            //         ...Object.keys(_children).map(chs =>
            //             _children[chs].map((ch,i) => ch.tree(-~t,i))
            //                 .join(`,${'\t'.repeat(t)}\n`) )
            //     ].join(`,${'\t'.repeat(t)}\n`)
            //     }}`},
        })
        Z[_id]=$; //global id
        if($pa_children)$pa_children[$]=($pa_children[$]??[]).concat($) //append jsxs to exist children

        await fetch(href).then(r=>r.text()).then(async str=>{
            let {0:script,2:js,index}=/<script>(\n|\r)*((.|\n|\r)*?)<\/script>/.exec(str)??{0:0,2:0,index:0};
            //js set
            // new Function('$',js).call(el,$)
            new (Object.getPrototypeOf(async f=>f).constructor)('$','arguments',
                // `if(constructor)$('@NEW').then(constructor);`+
                js).call(el,$,_arguments)
            // new Function('$','mount','dismount',js).call(el,$,1,2)
            //(L=new (Object.getPrototypeOf(function*(){}).constructor)('$','mount','dismount',js).call(el,$,1,2)).next()

            //HTML, CSS set
            str=P($,str.substr(0,index)+str.substr(index+script.length))
            let [style,,css]=/<style>(\n|\r)*((.|\n|\r)*?)<\/style>/.exec(str)??[0,0,0];
            let htm=str.replace(style,'').trim();
            if(css)htm+=`\n<style>\n${css}</style>`;
            el.insertAdjacentHTML('beforeend',htm);
            //bind jobs:
            let bindlate=[].slice.call(el.querySelectorAll(E.map(e=>`[${e}]`).join(',')));
            //await load nested:
            await $()
            //binds:
            bindlate.forEach(ch=>{
                if(!ch.parentElement)return //console.log('bind parent=null', {ch});
                E.forEach(ev=>{
                    let bin= ch.getAttribute(ev) ;
                    if(!bin)return;else ch.removeAttribute(ev);
                    //TODO: by $ scope //best 1st ?
                    let bind = $(bin);
                    (ch['on'+ev.slice(1)]=bind||console.error({el,ch,bin,bind},Error('bind')))
                    //&&console.log(`${ch.className}.on${ev.slice(1)}=.${$+bind}`)
                })
            })
        })
        // L.next()
        // $('@mount')
        // console.log('mount')
        life.MOUNT?.()
        return $;
    })
}