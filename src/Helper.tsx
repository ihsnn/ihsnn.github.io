export function scrollToTop() {
  const element = document.getElementById('scroll')!
  element.scrollBy({
    top:-element.scrollHeight,
    behavior:'smooth'
  });
}

export function scrollToBottom() {
  const element = document.getElementById('scroll')!
    element.scrollBy({
    top: element.scrollHeight,
    behavior:'smooth'
  });
}

export function scrollUp() {
  const element = document.getElementById('scroll')!
  // element.scrollTop = element.scrollHeight;
  // element.scrollBy(0, element.scrollHeight);
  element.scrollBy({
    top:-100,
    behavior:'smooth'
  });
}

export function scrollDown() {
  const element = document.getElementById('scroll')!
  element.scrollBy({
    top:100,
    behavior:'smooth'
  });
}