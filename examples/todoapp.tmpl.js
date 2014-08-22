[
	H1("Mithril bindings Todos - " + data.remaining() + " of " + data.todos().length + " remaining"),
	BUTTON({ onclick: data.archive }, "Archive"),
	UL([
		data.todos().map(function(todo, idx){
			return LI({ class: todo.done()? "done": "", fadeout: todo.done }, todo.text);
		})
	]),
	FORM({ onsubmit: data.addTodo }, [
		INPUT({ type: "text", value: data.input, placeholder: "Add todo" }),
		BUTTON({ type: "submit"}, "Add")
	])
]