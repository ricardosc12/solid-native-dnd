import {
    DragDropProvider,
    DragDropSensors,
    DragOverlay,
    createDraggable,
    createDroppable,
} from "@thisbeyond/solid-dnd";
import { createSignal, For, Show } from "solid-js";
import style from './style.module.css'

const Draggable = () => {
    const draggable = createDraggable(1);
    return (
        <div
            use:draggable
            class="draggable cursor-pointer"
            classList={{ "opacity-25": draggable.isActiveDraggable }}
        >
            Draggable
        </div>
    );
};

const Droppable = (props) => {
    const droppable = createDroppable(props.id);
    return (
        <div
            use:droppable
            class="droppable h-20 bg-red-400 m-1"
            classList={{ "!droppable-accept": droppable.isActiveDroppable }}
        >
            Droppable.
            {props.children}
        </div>
    );
};

export const DragOverlayExample = () => {
    const [where, setWhere] = createSignal("outside");

    let ref_node = null;

    const onDragEnd = ({ droppable }) => {
        if (droppable) {
            setWhere("inside");
        } else {
            setWhere("outside");
        }
        if(ref_node) {
            ref_node.classList.toggle('shadow')
            ref_node = null
        }
    };

    const onDragStart = (e) => {
        console.log(e)
    };

    const onDragOver = ({ droppable }) => {
        const node = droppable?.node
        if(node) {
            ref_node&&(ref_node.classList.toggle('shadow'))
            ref_node = node
            ref_node.classList.toggle('shadow')
        }

    };

    return (
        <div>
            <DragDropProvider onDragOver={onDragOver} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <DragDropSensors />
                <div className="flex">
                    <Show when={where() === "outside"}>
                        <Draggable />
                    </Show>
                </div>
                <DragOverlay>
                    <div class={style.drag}>Drag Overlay!</div>
                </DragOverlay>

                <table className={style.root_table}>
                    <tbody>
                        <tr>
                            <For each={Array(10)}>
                                {(_, index) => (
                                    <td>{index()}</td>
                                )}
                            </For>
                        </tr>
                        <For each={Array.from(Array(20))}>
                            {(_, ext) => (
                                <tr>
                                    <For each={Array.from(Array(10))}>
                                        {(_, iner) => (
                                            <td>
                                                <Droppable id={`${ext()}:${iner()}`}>
                                                    <Show when={where() === "inside"}>
                                                        <Draggable />
                                                    </Show>
                                                </Droppable>
                                            </td>
                                        )}
                                    </For>
                                </tr>
                            )}
                        </For>
                    </tbody>
                </table>
            </DragDropProvider>

        </div>

    );
};