const body = document.querySelector('body');

if (body) {
  body.addEventListener('click', (event) => {
    console.log(event);
  });
  window.addEventListener('scroll', (event) => {
    console.log(event);
  });
}