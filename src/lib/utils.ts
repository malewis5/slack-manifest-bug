import * as readline from "readline";

export function waitForEnter(prompt: string): Promise<void> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.once("data", () => {
      resolve();
    });
  });
}

export function promptForInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
