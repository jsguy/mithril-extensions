# mithril-extensions

This set of extensions for mithril exist to address the following:

* The tags used in the views are rather verbose
* It would be nice to be able to formally use external/in-dom templates

## Sugar tags

Sugar'd tags for mithril view system - less code, less clutter, more awesome.

### With sugar tags

    UL({class: "listy"}, [
        LI(A({href: '#'}, "item 1")),
        LI(A({href: '#'}, "item 2")),
        LI(A({href: '#'}, "item 3"))
    ])

### Without sugar tags

    m("ul", {class: "listy"}, [
        m("li", m("a", {href: '#'}, "item 1")),
        m("li", m("a", {href: '#'}, "item 2")),
        m("li", m("a", {href: '#'}, "item 3"))
    ])

It works the same as normal mithril tags, and can be compiled and optimised just the same.

## Templates

The templating system brings together the ability to add templates in the controller, inside the dom or loaded via ajax - all able to be nested.

### In-dom template

*Note:* you must set the type as "text/mithrill" for it to work correcty

    <script id="tmpl" type="text/mithrill">
        DIV("This is my template")
    </script>

To use it, you refer to it by ID (in this case 'tmpl')

    m.template('tmpl', data)

### Ajax loaded template

*Note:* there are two steps to use ajax loaded templates

A. Setup remote loading for template in the controller

    this.tmpl = m.template.load("tmpl.js");

B. Use it from within another template

    m.template(data.inputTmpl(), data)

### In-controller template

    this.tmpl = function(data){
        with(m.sugarTags) {
            return DIV("This is my template")
        };
    };

To use it, you can call the template function

    m.template(data.tmpl, data)

