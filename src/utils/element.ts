export async function removeEl(
  selectors = "div",
  { el = document.body as Element, retry = 0, time = 200 } = {}
) {
  if (retry === 0) el.querySelector(selectors)?.remove();
  else {
    const e = await findEl(selectors, { el, retry, time });
    e.remove();
  }
}

export async function removeAllEl(
  selectors = "div",
  { el = document.body as Element, retry = 0, time = 200, size = 0 } = {}
) {
  if (retry === 0) el.querySelectorAll(selectors).forEach((e) => e.remove());
  else {
    const e = await findAllEl(selectors, { el, retry, time, size });
    e.forEach((e) => e.remove());
  }
}

export function findEl<E extends Element = Element>(
  selectors = "div",
  { el = document.body as Element, retry = 0, time = 200 } = {}
) {
  return new Promise<E>((resolve, reject) => {
    let t = setInterval(() => {
      const e = el.querySelector<E>(selectors);
      if (e) {
        clearInterval(t);
        resolve(e);
      }
      if (retry === 0) {
        clearInterval(t);
        reject(new Error("Element not found"));
      }
      retry--;
    }, time);
  });
}

export function findAllEl<E extends Element = Element>(
  selectors = "div",
  { el = document.body as Element, retry = 0, time = 200, size = 0 } = {}
) {
  return new Promise<NodeListOf<E>>((resolve, reject) => {
    let t = setInterval(() => {
      const e = el.querySelectorAll<E>(selectors);
      if (e.length > size) {
        clearInterval(t);
        resolve(e);
      }
      if (retry === 0) {
        clearInterval(t);
        reject(new Error("Element not found"));
      }
      retry--;
    }, time);
  });
}
