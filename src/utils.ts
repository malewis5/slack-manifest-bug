export function waitForEnter(prompt: string): Promise<void> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.once("data", () => {
      resolve();
    });
  });
}
