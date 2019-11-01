import { PointerEvent } from "../../enums/EventName";

window.addEventListener(PointerEvent.pointermove, (event) => {
  console.log('point event: ', event);
});