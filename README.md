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
	- [Redirection (computing)](#computing)
	- [Сhaining selectors](#chaining)
5. [$ internal api (jsx supperclass)](#api)
	- [$.toString()](#tostring)
	- [$.removeChildren()](#removechildren)
	- [$.tree()](#tree)
6. [$ as jsx scope](#scope)
	- [S({})](#dto)
7. [Nested Components](#nested)
8. [Bind](#bind)
	- [events](#event)
	- [extend from child](#extend)
	- [emit to parent](#emit)
9. [Slots](#slots)
	- [main](#mainslot)

# <a id=deploy></a>Deploy
## clone
```shell
git clone https://github.com/impfromliga/jsxldr.git
```
## <a id=install></a>install
```shell
npm i
```
## <a id=run></a>run (Live Preview)
```shell
npm run start
```
# <a id=integration></a>Integration
## <a id=connect></a>Connect the library
- just ad the end of the body:
```html
<script type="module">import jsxldr from"./jsxldr.js";jsxldr()</script>
```
## <a id=components></a>include youre components
```html
<div _class="foo:component.htm"></div>
```
- will init jsx load from component.htm to &lt;div class=foo&gt;
- if some classes already set, class=.foo will be set by native element.classList.add()
- deafault file extension is .htm it can be omited
# <a id=syntax></a>Component syntax
## &lt;html&gt;
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
- component can be writed as .html file

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
# <a id=lifecycle></a>Lifecycle $('@STAGE')
- init time is first time of running wrapped youre &lt;script&gt; section, so use top of it
```js
<script>
	//init
await $('@MOUNT') //resolved before parent loader(this):Promise
  //after mounted code...
await $('@DISMOUNT') //resolved before parent removeChilds(this):Promise
  //dismount for now only for root child (would be upgraded soon)
</script>
```
# <a id=selector></a>$('.query.selector')
## basic features:
will work also in &lt;style&gt; section
- selector for querySelector method will replace .__ leading pattern by root className (.foo in example)
- exact .__ selector will return this (rootElement) directly
- [An+B] or [B] will replace to :nth-of-type(An+B) A is 0 as default
- [An-B] or [-B] will replace to :nth-last-of-type(An+B) A is 0 as default
## advansed:
that work in $() and _click= (etc events) attribute binds
- starting with '&lt;' selector will pass trailing string to parent jsx querySelector (eny times)
- starting with '&gt;' selector will replace as :scope&gt; (Selectors Level 4)
- trailing '$' will return jsx scope of finding element(s)
- after '$' allowing to follow prop1.prop2...propN chain that will get this from jsx scope
	- combining like '>$' will return first children (or select all in .removeChilds)
	- '<$' return the parrent jsx scope
	- '<$emit' return parrent.emit prop - in can use for binding event from arrtibute, or emit from js
## <a id=undefined></a>$(undefined)
dummy
- return Promise.all( this.loadChildrenNow() )
- shortcut for update & upload new inserted [_class] components
```js
//now can use for cheepy inline adds like:
$(
  this.insertAdjacentHTML('beforeend',`<div class=${$}__el_modifi></div>`),
  this.insertAdjacentHTML('beforeend',`<div class=${$}__el_modifi></div>`),
  this.insertAdjacentHTML('beforeend',`<div class=${$}__el_modifi></div>`),
).then((...$loadedChildren)=>{})
```
## <a id=computing></a>Redirection - $('selector', function):Promise&lt;[]&gt;
for map selector results by another function
```js
$('>.__el_mod', this.removeChild).then(([mapped_result])=>{})
```

## <a id=chaining></a>Chaining $('selector', 'selector', ..., function):Promise&lt;[]&gt;
(in test)
- in this case every selector will recursively interpreate by current child
- ".__" pattern and "$" same individual

# <a id=api></a>Internal $. api methods
(inherited from jsx supper class)
- this methods are reserved and dont iterable by for / forEach / Object.keys()
## <a id=toString></a>$.toString()
- return root component className.
- It usefull for pass root component className to string representations (like template strings binding) by passing component scope
```js
	`<div class=${$}__element_modificator>`
//	<div class=block__element_modificator>
```

## <a id=removechildren></a>$.removeChildren(el | el[] | String)
- remove from jsx all elements[]=$(selector)
- dont throwing Exception instead of this
- return deleted elements[] or null if no one deleted (for youre self check)
## <a id=tree></a>$.tree(tabs:Number)
debug
- can be used for log recursive tree of virtual element binded scope (children & methods)

# <a id=scope></a>$ as jsx component scope
this can be redefine and/or add new ones
- there are simply set $.youre_prop = youre_value;
- there are public for eny other jsx componet witch have link to this scope
- used for dom events bindins by parent, child, or component itself
## <a id=dto></a>$({})
- get dto (soon)

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
# <a id=slots></a>Slots
## <a id=mainslot></a>Main slot
You can add sub layaut inside jsx component, by default it will append at the begin of it
  - the jsx binds will applied as they'll be add by component layout
  - css injections will not be parsed by library features
  - no js injections at all
```html
<div class=__template _class=jsx.htm>
    Task-list <button _click=<$create>+</button>:
</div>
```
 - add &lt;!--slot-main--&gt; for choose place for main slot (soon)

# TODO Roadmap
## features
- autoload dynamic children jsx by MutationObserver
- bind with arguments
	- [_class=jsx()] child constructor argument standart
	- [_class=jsx($handle:Emitter)] validate child by emiting interfaces
- separate $() api to $ and $$ api for single multiple selects?
	- $('className[]') return childs[], :fisrt/last-of-type converts to [0/-1] child
- dismount for only root child
- slots

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
