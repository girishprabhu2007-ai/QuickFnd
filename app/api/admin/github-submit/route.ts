/**
 * POST /api/admin/github-submit
 * Automatically creates a PR to add QuickFnd to GitHub awesome lists.
 *
 * Requires GITHUB_TOKEN env var with repo scope.
 * Creates a fork + branch + PR on relevant awesome lists.
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE_URL = "https://quickfnd.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

// Awesome lists to target — (owner/repo, file path, section, entry)
const AWESOME_LISTS = [
  {
    id: "awesome-web-tools",
    repo: "lvwzhen/awesome-tools",
    file: "README.md",
    section: "## Online Tools",
    entry: "- [QuickFnd](https://quickfnd.com) - 130+ free browser-based tools including JSON formatter, EMI calculator, password generator. No install, no account needed.",
    prTitle: "Add QuickFnd — free browser-based tools platform",
    prBody: "QuickFnd offers 130+ free tools that run in the browser. Relevant to this list as it covers developer tools, calculators, and AI utilities. Site: https://quickfnd.com",
  },
  {
    id: "free-for-dev",
    repo: "ripienaar/free-for-dev",
    file: "README.md",
    section: "## Tools for Teams and Collaboration",
    entry: "  * [QuickFnd](https://quickfnd.com) — 130+ free browser-based tools: JSON formatter, regex tester, password generator, calculators and more. No signup required.",
    prTitle: "Add QuickFnd to free developer tools",
    prBody: "QuickFnd is a collection of 130+ free tools that run entirely in the browser. No account, no install needed. Covers developer tools (JSON, regex, UUID, JWT), calculators, and AI tools. https://quickfnd.com",
  },
];

async function githubRequest(path: string, method = "GET", body?: object) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "QuickFnd-Bot",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json();
}

async function submitToRepo(
  list: typeof AWESOME_LISTS[0]
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const [owner, repo] = list.repo.split("/");

    // 1. Get the repo to find default branch
    const repoData = await githubRequest(`/repos/${owner}/${repo}`);
    const defaultBranch = repoData.default_branch || "main";

    // 2. Fork the repo
    await githubRequest(`/repos/${owner}/${repo}/forks`, "POST");
    // Wait for fork to be ready
    await new Promise(r => setTimeout(r, 4000));

    // Get authenticated user's login
    const user = await githubRequest("/user");
    const myLogin = user.login;

    // 3. Get the file content from the FORK
    let fileData: { sha: string; content: string };
    try {
      fileData = await githubRequest(`/repos/${myLogin}/${repo}/contents/${list.file}`);
    } catch {
      // Try from original if fork not ready
      fileData = await githubRequest(`/repos/${owner}/${repo}/contents/${list.file}`);
    }

    const currentContent = Buffer.from(fileData.content, "base64").toString("utf-8");

    // Check if already submitted
    if (currentContent.includes("quickfnd.com")) {
      return { success: false, error: "Already listed in this repository" };
    }

    // 4. Find insertion point and add entry
    const sectionIdx = currentContent.indexOf(list.section);
    if (sectionIdx === -1) {
      // Section not found — append to end
      const newContent = currentContent + "\n\n" + list.section + "\n" + list.entry + "\n";
      const encoded = Buffer.from(newContent).toString("base64");

      // Create new branch on fork
      const branchName = `add-quickfnd-${Date.now()}`;
      const mainRef = await githubRequest(`/repos/${myLogin}/${repo}/git/ref/heads/${defaultBranch}`);
      const sha = mainRef.object.sha;

      await githubRequest(`/repos/${myLogin}/${repo}/git/refs`, "POST", {
        ref: `refs/heads/${branchName}`,
        sha,
      });

      await githubRequest(`/repos/${myLogin}/${repo}/contents/${list.file}`, "PUT", {
        message: list.prTitle,
        content: encoded,
        sha: fileData.sha,
        branch: branchName,
      });

      // Create PR
      const pr = await githubRequest(`/repos/${owner}/${repo}/pulls`, "POST", {
        title: list.prTitle,
        body: list.prBody,
        head: `${myLogin}:${branchName}`,
        base: defaultBranch,
      });

      return { success: true, url: pr.html_url };
    }

    // Find next section after the target section
    const afterSection = currentContent.indexOf("\n## ", sectionIdx + list.section.length);
    const insertAt = afterSection !== -1 ? afterSection : currentContent.length;

    // Insert entry before next section
    const newContent = currentContent.slice(0, insertAt) + "\n" + list.entry + "\n" + currentContent.slice(insertAt);
    const encoded = Buffer.from(newContent).toString("base64");

    const branchName = `add-quickfnd-${Date.now()}`;
    const mainRef = await githubRequest(`/repos/${myLogin}/${repo}/git/ref/heads/${defaultBranch}`);

    await githubRequest(`/repos/${myLogin}/${repo}/git/refs`, "POST", {
      ref: `refs/heads/${branchName}`,
      sha: mainRef.object.sha,
    });

    await githubRequest(`/repos/${myLogin}/${repo}/contents/${list.file}`, "PUT", {
      message: list.prTitle,
      content: encoded,
      sha: fileData.sha,
      branch: branchName,
    });

    const pr = await githubRequest(`/repos/${owner}/${repo}/pulls`, "POST", {
      title: list.prTitle,
      body: list.prBody,
      head: `${myLogin}:${branchName}`,
      base: defaultBranch,
    });

    return { success: true, url: pr.html_url };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!GITHUB_TOKEN) {
    return NextResponse.json({
      error: "GITHUB_TOKEN not set. Add it to Vercel environment variables.",
      setup: "1. Go to github.com/settings/tokens → Generate new token (classic) → check 'repo' scope → copy token → add to Vercel as GITHUB_TOKEN"
    }, { status: 400 });
  }

  const body = await req.json() as { list_id?: string };
  const lists = body.list_id
    ? AWESOME_LISTS.filter(l => l.id === body.list_id)
    : AWESOME_LISTS;

  const results = [];
  for (const list of lists) {
    const result = await submitToRepo(list);
    results.push({ id: list.id, repo: list.repo, ...result });
    await new Promise(r => setTimeout(r, 2000));
  }

  return NextResponse.json({
    success: true,
    submitted: results.filter(r => r.success).length,
    results,
  });
}