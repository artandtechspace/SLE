
// Short name for the queryselector-function
export const S: (name: string, base?: HTMLElement) => HTMLElement = (name: string, base: HTMLElement = document.body) => base.querySelector(name) as HTMLElement;
