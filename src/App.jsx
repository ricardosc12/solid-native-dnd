import { createEffect, createSignal, on, onCleanup, onMount, splitProps } from "solid-js";
import { DragOverlayExample } from "./dnd";
import { render } from "solid-js/web";

const DragAndDrop = (props) => {

	let actual_element;

	let counter = 0;

	function handleStart(e) {
		console.time('dragstart')
		// e.dataTransfer.setDragImage(e.target, 0, 0);
		actual_element = e.target
		props.onDragStart(e.target.getAttribute('data-drag'))
		console.timeEnd('dragstart')
	}

	function handleDragEnd() {
		actual_element = null;
	}

	function handleDragOver(e) {
		e.dataTransfer.dropEffect = 'move';
		e.preventDefault();
	}

	onCleanup(() => {
		document.removeEventListener("dragstart", handleStart, false)
		document.removeEventListener('dragend', handleDragEnd, false)
		document.removeEventListener('dragover', handleDragOver, false)
	})

	createEffect(() => {
		console.log(props.wek)
		setTimeout(() => {
			console.time('onmount')
			const droppable = document.getElementsByName('droppable')
			document.addEventListener("dragstart", handleStart, false)
			for (const dropper of droppable) {
				dropper.ondrop = (e) => {
					console.time('drop')
					counter = 0;
					e.preventDefault()
					props.onDragEnd(
						{
							draggable: {
								el: actual_element,
								data: actual_element.getAttribute('data-drag')
							},
							droppable: {
								el: dropper,
								data: dropper.getAttribute('data-drag')
							},
						}
					)
					console.timeEnd('drop')
				}
				dropper.ondragleave = (e) => {
					counter--;
					if (counter == 0) {
						console.time('ondragleave')
						props.onDragLeave({
							draggable: {
								el: actual_element,
								data: actual_element.getAttribute('data-drag')
							},
							droppable: {
								el: dropper,
								data: dropper.getAttribute('data-drag')
							},
						})
						console.timeEnd('ondragleave')
					}

				}
				dropper.ondragenter = (e) => {
					counter++;
					if (counter != 1) return
					console.time('ondragenter')
					props.onDragEnter(
						{
							draggable: {
								el: actual_element,
								data: actual_element.getAttribute('data-drag')
							},
							droppable: {
								el: dropper,
								data: dropper.getAttribute('data-drag')
							},
						}
					)
					console.timeEnd('ondragenter')
				}
			}
			document.addEventListener('dragend', handleDragEnd, false)
			document.addEventListener('dragover', handleDragOver, false)
			console.timeEnd('onmount')
			document.getElementById('loading').innerHTML = ""
		})
	})

	return props.children
}

const Droppable = (props) => {
	return (
		<div name="droppable" data-drag={props.id}>
			<div className="flex bg-slate-700 drop-zone">
				{props.children}
			</div>
		</div>
	)
}

const Draggable = (props) => {
	return (
		<div className="dragger" data-drag={props.id} draggable="true">
			<div className="bg-slate-800 text-white p-5">
				<div>Title</div>
				<div>WEK {props.wek}</div>
			</div>
		</div>
	)
}

function App() {


	const [list, setList] = createSignal({
		dropper1: [],
		dropper2: []
	}, { equals: false })

	onMount(() => {
		const items = {}
		for (let index = 0; index < 6552; index++) {
			items["dropper" + index] = Array.from(Array(15))
		}
		setList(items)
	})

	const onDragStart = (draggable) => {

	}

	const onDragEnd = ({ draggable, droppable }) => {
		console.time('drag end')
		if (!droppable.data) return
		const items = list()
		if (Array.isArray(items[droppable.data])) {
			items[droppable.data].push(1)
		}
		else {
			items[droppable.data] = [1]
		}
		setList(items)
		if (el_marked) {
			el_marked.classList.remove('shadow')
			el_marked = null
		}
		console.timeEnd('drag end')
	}

	let el_marked = null;

	const onDragEnter = ({ draggable, droppable }) => {
		if (!droppable.data) return
		droppable.el.classList.add("shadow")
		if (el_marked && el_marked != droppable.el) {
			el_marked.classList.remove('shadow')
		}
		el_marked = droppable.el
	}

	const onDragLeave = () => {
		if (el_marked) {
			el_marked.classList.remove('shadow')
			el_marked = null
		}
	}

	const [weak, setWeak] = createSignal(0)

	function set() {
		document.getElementById('loading').innerHTML = "Loading..."
		setTimeout(() => {
			console.time('wek')
			setWeak(document.getElementById('wek').value)
			console.timeEnd('wek')
		});
		

	}

	return (
		<div className="main flex-col">
			<DragAndDrop wek={weak()} onDragStart={onDragStart} onDragLeave={onDragLeave} onDragEnd={onDragEnd} onDragEnter={onDragEnter}>
				{/* <DragOverlayExample /> */}
				<div id="loading"></div>
				<input placeholder="Semana" type="text" id="wek" />
				<button onClick={set}>SET</button>
				<Draggable id="drag1" />
				<div className="flex justify-start items-start space-x-10">
					<For each={Array.from(Array(52))}>
						{(_, indexwek) => {
							return (
								<Show when={indexwek() == weak()} fallback={() => <div>LOADING...</div>}>
									<For each={Array.from(Array(126))}>
										{(_, index) => {
											return (
												<Droppable id={"dropper" + ((indexwek() * 126) + index() + 1)}>
													<For each={list()['dropper' + ((indexwek() * 126) + index() + 1)]}>
														{(item) => {
															return <Draggable wek={weak()} id="drag1" />
														}}
													</For>
												</Droppable>
											)
										}}
									</For>
								</Show>
							)
						}}
					</For>

					<div className="bg-slate-700 h-40 w-20">
						TESTE
					</div>
				</div>
			</DragAndDrop>

		</div>
	);
}

export default App;
