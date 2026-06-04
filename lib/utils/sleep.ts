export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function demoDelay(index: number) {
  return 900 + (index % 5) * 100;
}
