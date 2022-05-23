# jsxldr
MicroLoader for fancy jsx components

0. [Deploy](#deploy) ([clone](#clone)/[install](#install)/[run](#run))
1. [Integration](integration)
	- [Connect the library](#connect)
	- [Include youre components](#components)
2. [Component syntax &lt;html&gt;](#syntax)
	- [&lt;style&gt;](#style)
	- [&lt;script&gt;](#script)
3. [lifecycle](#lifecycle)
4. [$ as selector](#selector)
5. [$ internal api (jsx supperclass)](#api)
	- [$.toString()](#tostring)
	- [$.removeChilds()](#removechilds)
	- [$.log()](#log)
6. [$ as jsx scope](#scope)
	- [S.dismount()](#dismount)
7. [Nested Components](#nested)
8. [Bind](#bind)
	- [events](#event)
	- [extend from child](#extend)
	- [emit to parent](#emit)

# <a id=deploy></a>Deploy
## Clone
```shell
git clone https://github.com/impfromliga/jsxldr.git
```
## <a id=install></a>Install
```shell
npm i
```
## <a id=run></a>Run (Live Preview)
```shell
npm run start
```
# <a id=integration></a>integration
## <a id=connect></a>Connect the library
- just add in head or in body:
```html
<script src="jsxldr.js"></script>
```
## <a id=components></a>Include youre components
```html
<div _class="foo:component.htm"></div>
```
- will init jsx load from component.htm to &lt;div class=foo&gt;
- if some classes already set, class=.foo will be set by native element.classList.add()
- deafault file extension is .htm it can be omited
# <a id=syntax></a>Component syntax &lt;html&gt;
- component can be writed as .html file
```html
<!-- component layout without root (omitted) -->

<script>
	/* component code (single section will be cut from src) */
</script>

<style>
	/* component styles (single section will be cut from src) */
</style>
```
- everything that is not cut will stay as html layout

Compiled element will look like
```html
<div calss="native_class jsx_class" jsx=internal_jsx_id_number_autoincrement>
	<!-- youre layout -->
	<style>
    	<!-- youre style section -->
	</style>
</div>
```
- js is Evaled & scoped virtual
## <a id=style></a>&lt;style&gt; section
- every leading .__ pattern will replaced by root component className ( .foo in example)
- you can better combine styles by BEM syntax
## <a id=script></a>&lt;script&gt; section
- will be wrapped to
```js
function load($){
	//wrapping section code
}
```
- function runs when DOM is loaded
- this will applyed to rootElement ( .foo in example)
- $ argument pass the patched query selector functionality and above component scope
# <a id=lifecycle></a>Lifecycle
- onload() is virtual wrap youre &lt;script&gt; section, so use its body
- no special onmount(), just add single queueMicrotask(f=>{})
[Microtask queuing spec](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#microtask-queuing)
- dismount() adding by set $.dismount in your &lt;script&gt; section
```js
<script>
	//onload
	queueMicrotask(f=>{
		//onmount
	})
	$.dismount=e=> //ondismount	//for now only for root child (would be upgraded soon)
</script>
```
# <a id=selector></a>$(String) as query selector
## basic features:
will work also in &lt;style&gt; section
- selector for querySelector method will replace .__ leading pattern by root className (.foo in example)
- exact .__ selector will return this (rootElement) directly
- [B] or [An+B] will replace to :nth-of-type(An+B) A is 0 as default
- [-B] or [An-B] will replace to :nth-last-of-type(An+B) A is 0 as default
## advansed:
that work in $() and _click= (etc events) attribute binds
- starting with '&lt;' selector will pass trailing string to parent jsx querySelector (eny times)
- starting with '&gt;' selector will replace as :scope&gt; (Selectors Level 4)
- trailing '$' will return jsx scope of finding element(s)
- after '$' allowing to follow prop1.prop2...propN chain that will get this from jsx scope
	- combining like '>$' will return all children array
	- '<$' return the parrent jsx scope
	- '<$emit' return parrent.emit prop - in can use for binding event from arrtibute, or emit from js
## <a id=undefined></a>$(undefined)
dummy
- shortcut for upload new inserted class_=jsx.htm components
```js
//now can use for cheepy inline adds like:
$( this.insertAdjacentHTML('beforeend',`<div class=${$}__element_modificator></div>`) )
```

# <a id=api></a>$. internal api methods
(inherited from jsx supper class)
- this methods are reserved and dont iterable by for / forEach / Object.keys()
## <a id=toString></a>$.toString()
- return root component className.
- It usefull for pass root component className to string representations (like template strings binding) by passing component scope
```js
	`<div class=${$}__element_modificator>`
//	<div class=block__element_modificator>
```

## <a id=removechilds></a>$.removeChilds(el | el[] | String)
- remove from jsx all elements[]=$(selector)
- !Important if you whan remove jsx by selector you need to select it with trailing '$' or you remove only HTML elements
- dont throwing Exception instead of this
- return deleted elements[] or null if no one deleted (for youre self check)
## <a id=log></a>$.log(tabs:Number)
debug
- can be used for log recursive tree of virtual element binded scope (children & methods)

# <a id=scope></a>$ as jsx component scope
this can be redefine and/or add new ones
- there are simply set $.youre_prop = youre_value;
- there are public for eny other jsx componet witch have link to this scope
- used for dom events bindins by parent, child, or component itself
## <a id=dismount></a>$.dismount()
- this will call before component is dismount by parent.removeChild()

# <a id=nested></a>Nested Components
- Worked by static (recursive fetching files)
- Worked by calling $(undefined) (or without argument)
	- then new :scope>[_class] elements will detected

# <a id=bind></a>Bind events
You can force config const eventTypes to extend library by other native DOM events, but some may need extra checks. For now config set supporting for following:
- click
- change
- dblclick

property getter in all case getters of $.property descriptor will run once on binding
## <a id=event></a>bind event to self method
```html
<button _click=$method></button>
<script>
	$.method=e=> //do something
</script>
```
## <a id=extend></a>extend call child method
```html
<button _click=.sub$method></button>
<div _class=sub:subcomponent.htm></div>
```
- click will call $.method of .sub element from subcomponent.htm &lt;script&gt; section
## <a id=emit></a>emit event to parent
```html
<button _click=<$method></button>
```
# TODO Roadmap
## features
- autoload dynamic children jsx by MutationObserver
- bind with arguments
	- [_class=jsx()] child constructor argument standart
	- [_class=jsx($handle:Emitter)] validate child by emiting interfaces
- separate $() api to $ and $$ api for single multiple selects?
	- $('className[]') return childs[], :fisrt/last-of-type converts to [0/-1] child
## fixes
## optimization
- fetch cache (for now just browser/server chache somehow)

## moot features
```js
$({}) //one pass set component scope
f[Symbol.toStringTag] //detect async function binding (and then update)
f=>Promise[] //runtime detect Promise or Promise[] for update when resolve

shortcut $('beforeend',`<div _class=component></div>`) by insertAdjacentHTML and $.update
	$('<div _class=component></div>') //capture exact load targets
		_class=component(args) //component constructor args
		_value={$prop} //argument reactive bind

rig, jet, fit,
gem, orb, ice,
imp, lox, erg,
```
