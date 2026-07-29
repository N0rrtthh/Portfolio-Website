import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_USERNAME = "N0rrtthh";
const YEARS = [2022, 2023, 2024, 2025, 2026];

// Next.js static exports don't allow dynamic server API routes, and we don't
// want to bake a token into the public client-side JS bundle using NEXT_PUBLIC_.
// So we fetch this securely during the CI build process and save it to a JSON file.
async function fetchYear(year, token) {
  const gqlQuery = {
    query: `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      username: GITHUB_USERNAME,
      from: `${year}-01-01T00:00:00Z`,
      to: `${year}-12-31T23:59:59Z`,
    },
  };

  const data = JSON.stringify(gqlQuery);
  const options = {
    hostname: 'api.github.com',
    path: '/graphql',
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'User-Agent': 'Node.js/Next.js Build Script',
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`GitHub API returned status ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function buildWeeks(days, year) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const weeks = [];
  let currentWeek = [];

  const firstDate = new Date(`${year}-01-01T00:00:00`);
  const leadingPadding = firstDate.getDay();
  for (let i = 0; i < leadingPadding; i++) {
    currentWeek.push({ date: "", count: -1, level: -1 });
  }

  sorted.forEach((day) => {
    currentWeek.push({ date: day.date, count: day.count, level: day.level });
    if (currentWeek.length === 7) {
      weeks.push({ contributionDays: currentWeek });
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: "", count: -1, level: -1 });
    }
    weeks.push({ contributionDays: currentWeek });
  }

  return weeks;
}

async function main() {
  // Use PRIVATE_GITHUB_TOKEN (secure from GitHub secrets) or NEXT_PUBLIC_GITHUB_TOKEN (local fallback)
  const token = process.env.PRIVATE_GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  
  const outputData = {
    source: token ? "build_graphql" : "error",
    years: {},
    error: null
  };

  if (!token) {
    console.warn("⚠️ No PRIVATE_GITHUB_TOKEN or NEXT_PUBLIC_GITHUB_TOKEN provided. Skipping GraphQL fetch and leaving data empty.");
    outputData.error = "No token provided to build script.";
  } else {
    console.log(`🚀 Fetching secure GitHub GraphQL data for ${YEARS.join(', ')}...`);
    try {
      for (const year of YEARS) {
        const json = await fetchYear(year, token);
        const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
        
        if (calendar) {
          const flatDays = [];
          calendar.weeks.forEach((w) => {
            w.contributionDays.forEach((d) => {
              const count = d.contributionCount;
              const level = count === 0 ? 0 : count < 4 ? 1 : count < 8 ? 2 : count < 14 ? 3 : 4;
              flatDays.push({ date: d.date, count, level });
            });
          });

          const weeks = buildWeeks(flatDays, year);
          outputData.years[year] = {
            totalContributions: calendar.totalContributions,
            weeks
          };
          console.log(`   ✅ Success: ${year} (${calendar.totalContributions} total commits)`);
        } else {
          console.error(`   ❌ Failed: ${year} (Invalid response structure)`);
        }
      }
    } catch (err) {
      console.error("❌ GitHub GraphQL fetch failed during build:", err.message);
      outputData.source = "error";
      outputData.error = err.message;
    }
  }

  const outDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'github-data.json');
  fs.writeFileSync(outFile, JSON.stringify(outputData, null, 2));
  console.log(`💾 Saved contribution data to ${outFile}`);
}

main();
