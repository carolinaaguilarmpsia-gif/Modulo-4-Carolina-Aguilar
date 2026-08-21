/** Utilidades ANSI para demo en terminal */

export const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

export function banner(title: string): void {
  const line = '═'.repeat(Math.max(title.length + 4, 50));
  console.log(`\n${c.cyan}${c.bold}╔${line}╗${c.reset}`);
  console.log(`${c.cyan}${c.bold}║  ${title.padEnd(line.length - 2)}║${c.reset}`);
  console.log(`${c.cyan}${c.bold}╚${line}╝${c.reset}\n`);
}

export function step(n: number, msg: string): void {
  console.log(`${c.blue}${c.bold}[Paso ${n}]${c.reset} ${msg}`);
}

export function ok(msg: string): void {
  console.log(`  ${c.green}✔${c.reset} ${msg}`);
}

export function fail(msg: string): void {
  console.log(`  ${c.red}✖${c.reset} ${msg}`);
}

export function info(label: string, value: string): void {
  console.log(`  ${c.dim}${label}:${c.reset} ${c.yellow}${value}${c.reset}`);
}

export function stateBox(before: string, after: string): void {
  console.log(`
  ${c.dim}Estado${c.reset}
    ${c.magenta}${before}${c.reset}
         │
         │  ${c.bold}transición${c.reset}
         ▼
    ${c.green}${after}${c.reset}
`);
}

export function rule(tag: string, desc: string): void {
  console.log(`  ${c.cyan}[${tag}]${c.reset} ${desc}`);
}
