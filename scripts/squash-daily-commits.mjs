/**
 * Rewrites git history keeping max 6 commits/day.
 * Run: node scripts/squash-daily-commits.mjs
 */
import { execSync, spawnSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const MAX_PER_DAY = 6;
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

// Get all commits oldest-first
const log = execSync('git log --format="%H|%ad|%s" --date=format:"%Y-%m-%d" --reverse', { encoding: 'utf8', cwd: repoRoot });
const commits = log.trim().split('\n').map(line => {
  const idx = line.indexOf('|');
  const idx2 = line.indexOf('|', idx + 1);
  return { hash: line.slice(0, idx), date: line.slice(idx + 1, idx2), subject: line.slice(idx2 + 1) };
});

// Group by date, decide which to squash
const byDate = {};
for (const c of commits) (byDate[c.date] = byDate[c.date] || []).push(c);

const toSquash = new Set();
for (const list of Object.values(byDate)) {
  if (list.length <= MAX_PER_DAY) continue;
  const keepIdx = new Set([0, list.length - 1]);
  const step = (list.length - 1) / (MAX_PER_DAY - 1);
  for (let i = 1; i < MAX_PER_DAY - 1; i++) keepIdx.add(Math.round(i * step));
  list.forEach((c, i) => { if (!keepIdx.has(i)) toSquash.add(c.hash); });
}

console.log(`Total commits: ${commits.length}`);
console.log(`Will squash:   ${toSquash.size}`);
console.log(`Result:        ~${commits.length - toSquash.size} commits\n`);

// Build rebase todo
const todo = commits.map(c =>
  toSquash.has(c.hash)
    ? `fixup ${c.hash} ${c.subject}`
    : `pick ${c.hash} ${c.subject}`
).join('\n') + '\n';

// Write todo to C:\Temp (no spaces)
const todoPath = 'C:\\Temp\\rebase-todo.txt';
const editorPath = 'C:\\Temp\\rebase-editor.mjs';

writeFileSync(todoPath, todo);
writeFileSync(editorPath, `import{writeFileSync,readFileSync}from'fs';writeFileSync(process.argv[2],readFileSync('${todoPath.replace(/\\/g, '\\\\')}'));`);

console.log('Running git rebase -i --root ...\n');

const env = {
  ...process.env,
  GIT_SEQUENCE_EDITOR: `node "${editorPath}"`,
};

const result = spawnSync('git', ['rebase', '-i', '--root', '--no-autosquash'], {
  env,
  stdio: 'inherit',
  cwd: repoRoot,
});

try { unlinkSync(todoPath); unlinkSync(editorPath); } catch {}

if (result.status !== 0) {
  console.error('\n❌ Rebase failed. Run: git rebase --abort');
  process.exit(1);
}

console.log('\n✅ Rebase complete! Force pushing...');
execSync('git push origin main --force', { stdio: 'inherit', cwd: repoRoot });
console.log('✅ Done! Contribution graph updated.');
