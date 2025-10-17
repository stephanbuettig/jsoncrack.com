import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const distDir = path.join(repoRoot, "dist");

if (process.platform !== "win32") {
  console.error("The portable launcher can only be used on Windows.");
  process.exit(1);
}

if (!fs.existsSync(distDir)) {
  console.error("Portable build directory not found. Expected at", distDir);
  console.error("Run 'pnpm electron:build' to generate the portable executable.");
  process.exit(1);
}

const portableExecutables = fs
  .readdirSync(distDir)
  .filter((file) => file.toLowerCase().endsWith("-portable.exe"))
  .map((file) => {
    const fullPath = path.join(distDir, file);
    const stats = fs.statSync(fullPath);
    return { fullPath, mtimeMs: stats.mtimeMs };
  })
  .sort((a, b) => b.mtimeMs - a.mtimeMs);

if (portableExecutables.length === 0) {
  console.error("No portable executable found in", distDir);
  console.error("Run 'pnpm electron:build' to generate the portable executable.");
  process.exit(1);
}

const targetExecutable = portableExecutables[0].fullPath;
console.log("Launching portable build:", targetExecutable);

const child = spawn(targetExecutable, {
  stdio: "inherit",
  cwd: path.dirname(targetExecutable),
  windowsHide: false,
});

child.on("error", (error) => {
  console.error("Failed to launch portable build:", error.message);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
