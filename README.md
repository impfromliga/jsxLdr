# jsxldr
microLoader for tiny jsx components
# Install
```shell
npm i
```
# Run (Live Preview)
```shell
npm run start
```
# Connect the library
- just add in head or in body:
```html
<script src="jsxldr.js"></script>
```
# Include Components
```html
<div _class="foo:component.htm"></div>
```
- will init jsx load from component.htm to &lt;div class=foo&gt;
- if some classes already set, class=.foo will be set by native element.classList.add()
- deafault file extension is .htm it can be omited
# Components syntax
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
## &lt;style&gt; section
- every leading .__ pattern will replaced by root component className ( .foo in example)
- you can better combine styles by BEM syntax
## &lt;script&gt; section
- will be wrapped to
```js
function load($){
	//wrapping section code
}
```
- function runs when DOM is loaded
- this will applyed to rootElement ( .foo in example)
- $ argument pass the patched query selector functionality and above component scope
### onload / onmount / dismount
- onload function is virtual that wrapped youre script section use its body
- no special onmount function, just add single queueMicrotask(f=>{}) https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#microtask-queuing
js```
<script>
	//onload
	queueMicrotask(f=>{
		//onmount
	})
	$.dismount=e=> //ondismount	//for now only for root child (would be upgraded soon)
</script>
```
### $(selector)
#### basic features even will work in &lt;style&gt; section
- selector for querySelector method will replace .__ leading pattern by root className (.foo in example)
- exact .__ selector will return this (rootElement) directly
- [B] or [An+B] will replace to :nth-of-type(An+B) A is 0 as default
- [-B] or [An-B] will replace to :nth-last-of-type(An+B) A is 0 as default
#### advansed that work in $() and _click= (etc events) attribute bind
- starting with '&lt;' selector will pass trailing string to parent jsx querySelector (eny times)
- starting with '&gt;' selector will replace as :scope&gt; (Selectors Level 4)
- trailing '$' will return jsx scope of finding element(s)
- after '$' allowing to follow prop1.prop2...propN chain that will get this from jsx scope
	- combining like '>$' will return all children array
	- '<$' return the parrent jsx scope
	- '<$emit' return parrent.emit prop - in can use for binding event from arrtibute, or emit from js
### $.toString()
- return root component className.
- It usefull for pass root component className to string representations (like template strings binding) by passing component scope
```js
	`<div class=${$}__element_modificator>`
//	<div class=block__element_modificator>
```
### $.removeChilds(element|elements[]|selector:String)
- remove from jsx all elements[]=$(selector)
- !Important if you whan remove jsx by selector you need to select it with trailing '$' or you remove only HTML elements
- dont throwing Exception instead of this
- return deleted elements[] or null if no one deleted (for youre self check)
### $(undefined)
- shortcut for upload new inserted class_=jsx.htm components
```js
//can use for cheepy inline adds like:
$( this.insertAdjacentHTML('beforeend',`<div class=${$}__element_modificator></div>`) )
```
### $.log(tabs:Number)
- can be used for log recursive tree of virtual element binded scope (children & methods)
# Nested Components
- Worked by static
- Worked by $.appendChild(InnerHTML:String) call
# Supported Bind events
You can force config const eventTypes to extend library by other native DOM events, but some may need extra checks. For now config set supporting for following:
- click
- change
- dblclick
### property getter
- in all case getters of $.property descriptor will run once on binding
## self bind
```html
<button _click=$method></button>
<script>
	$.method=e=> //do something
</script>
```
## nested bind child method
```html
<button _click=.sub$method></button>
<div _class=sub:subcomponent.htm></div>
```
- click will call $.method of .sub element from subcomponent.htm &lt;script&gt; section
## nested bind parrent method (emiting)
```html
<button _click=<$method></button>
```
# TODO Roadmap
## features
- bind with arguments (child constructor standart)
- separete $() api to $ and $$ api for single multiple selects?
	- $('className[]') return childs[], :fisrt/last-of-type converts to [0/-1] child
- validate child by interface above _class
	- by emiting
## fixes
## optimization
- fetch cache (for now just browser/server chache somehow)

## moot features
```js
$({}) //one pass set component scope
f[Symbol.toStringTag] //detect async function binding (and then update)
f=>Promise[] //runtime detect Promise or Promise[] for update when resolve

$('beforeend',`<div _class=component></div>`) insertAdjacentHTML and $.update shortcut
	$('<div _class=component></div>') //capture exact load targets
		_class=component(args) //component constructor args
		_class=_{modificator}:component //argument reactive bind
```