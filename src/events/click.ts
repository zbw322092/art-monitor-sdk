const body = document.querySelector('body');

if (body) {
  window.addEventListener('click', (event: MouseEvent) => {
    console.log(event);
  });
}