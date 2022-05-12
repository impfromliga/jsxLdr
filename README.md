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
### $(selector)
- selector for querySelector method will replace .__ leading pattern by root className (.foo in example)
- exact .__ selector will return this (rootElement) directly
### $.toString()
- return root component className.
- It usefull for pass root component className to string representations (like template strings binding) by passing component scope
```js
	`<div class=${$}__element_modificator>`
//	<div class=block__element_modificator>
```
### $.appendChild(InnerHTML)
- overload this.appendChild(InnerHTML:string):HtmlElement|HtmlElement[]
- can append multiple, in this case return array of child nodes
### $.removeChild(HtmlElement)
- just alias for this.removeChild
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
## self bind
```html
<button _click=$method></button>
<script>
	$.method=e=> //do something
</script>
```
## nested bind
```html
<button _click=.sub$method></button>
<div _class=sub:subcomponent.htm></div>
```
- click will call $.method of .sub element from subcomponent.htm &lt;script&gt; section
# TODO Roadmap
- fetch cache
- bind arguments extend