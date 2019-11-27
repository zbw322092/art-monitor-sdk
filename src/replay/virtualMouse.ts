import './styles/mouse.css';

export class VirtualMouse {
  constructor(parent: Element) {
    this.initMouse(parent);
  }
  private mouse: HTMLDivElement;

  private initMouse(parent: Element) {
    this.mouse = document.createElement('div');
    this.mouse.classList.add('replayer-mouse');
    parent.appendChild(this.mouse);
  }

  public getMouse() {
    return this.mouse;
  }

  public updatePosition(x: number, y: number) {
    this.mouse.style.left = `${x}px`;
    this.mouse.style.top = `${y}px`;
  }

  public virtualClick() {
    this.mouse.classList.remove('active');
    this.mouse.classList.add('active');
  }
}