const fs = require('fs');
const path = require('path');

const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

const writeFile = (filePath, content) => {
  ensureDirectoryExistence(filePath);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created: ${filePath}`);
};

const files = {
  '.devcontainer/devcontainer.json': JSON.stringify({
    "name": "Node.js & TypeScript",
    "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
    "features": {
      "ghcr.io/devcontainers/features/github-cli:1": {}
    },
    "customizations": {
      "vscode": {
        "extensions": [
          "dbaeumer.vscode-eslint",
          "esbenp.prettier-vscode",
          "snyk-security.vscode-snyk"
        ]
      }
    },
    "forwardPorts": [5173, 9323],
    "postCreateCommand": "npm install && npx playwright install-deps"
  }, null, 2),

  'docker-compose.yml': `version: '3.8'
services:
  app:
    image: node:20
    volumes:
      - .:/app
    working_dir: /app
    command: sh -c "npm install && npm run dev"
    ports:
      - "5173:5173"
`,

  '.gitignore': `node_modules
dist
.env
.DS_Store
coverage/
test-results/
`,

  '.agent/rules/architect-guardrails.md': `**🛡️ GLOBAL IMMUTABILITY PROTOCOL (READ-ONLY ZONES)**
1.  **The Library is Sacred:** You are strictly forbidden from editing, deleting, or overwriting ANY file located in \`_agent-library/\` (or any parent directory starting with \`_\`).
2.  **Reference Only:** You may read these files to learn workflows. If you need to "use" a workflow, you must execute its steps in the *active project root*, not inside the library.
3.  **Exception:** You may only edit the library if the user prompt explicitly starts with: "ADMIN UPDATE:".

Master System Instructions v2.0

Role: You are a Senior React Architect specializing in ESM-based architecture. You prioritize structural integrity, strict typing, and separation of concerns over speed.

* **External Code Import:** Follow \`@ingest-monolith.md\` (Decompose -> Atomize -> Verify). NEVER save raw external files directly.

**Security Protocol (Zero Tolerance):**
1.  **Secrets:** NEVER hardcode API keys, tokens, or passwords.
    * Use \`import.meta.env.VITE_KEY\` (client) or \`process.env\` (server).
    * If a user asks for a key, create a \`.env.example\` file instead.
2.  **XSS Prevention:**
    * BANNED: \`dangerouslySetInnerHTML\` (unless explicitly authorized for rich text).
    * BANNED: \`eval()\`, \`setTimeout(string)\`, \`setInterval(string)\`.
    * BANNED: \`javascript:\` URIs in \`href\` props.
3.  **Dependency Safety:**
    * Do not install packages with fewer than 1k weekly downloads without warning the user.

Global Constraints & Context Loading:

Read First: Before answering coding requests, scan:

docs/component_glossary.md (The Index)

docs/architecture/current_dependency_graph.md (The Map)

.agent/workflows/ (Your Toolset)

No Hallucinated Imports: NEVER assume a file path.

If Path Aliases exist (e.g., @components), YOU MUST USE THEM.

Do not use relative paths (e.g., ../../) for imports outside the current directory.

Strict Separation: Enforce the Container/Presentational pattern.

Containers: Handle logic, state, and API calls.

Views: Pure functional components (JSX only).

Constraint: Never mix complex useEffect logic into a View component.

Workflow Protocol: You operate via defined workflows. When a user request matches a workflow trigger, adhere to that file's specific steps:

New Logic/UI: Follow @new-feature.md (Contract -> Atomic -> Integration).

Bugs/Errors: Follow @debug-test.md (Hypothesis -> Minimal Fix -> Verify).

Refactoring: Follow @optimize-module.md (Audit -> Refactor -> Verify).

Visual QA: Follow @e2e-verify.md (Browser-in-the-loop).

Refactoring Safety:

Check component_glossary.md before editing. Is this a "Shared Dependency"?

STOP & WARN: If a change affects the props interface of a component used by >2 parents, warn the user first.

Testing Strategy:

Logic: Default to Unit Tests (Jest/Vitest) with mandatory mocking for Containers.

User Flows: Use E2E Tests (Playwright) for navigation, layout, and critical path verification.

Constraint: Never verify a UI fix with a Unit Test; use E2E or manual verification steps.
`,

  '.agent/workflows/session-startup.md': `---
description: Session startup workflow
---
# Workflow: Session Startup (The Pulse)
1. **Auto-Docs**: Review 'docs/component_glossary.md' and 'docs/architecture/current_dependency_graph.md' to understand the system.
2. **Health Check**: Run 'npm run type-check' (if available) or check for critical errors in the terminal.
3. **Context Load**: Read the latest 'task.md' to understand the current state and active tasks.
`,

  '.agent/workflows/new-feature.md': `---
description: New feature development workflow
---
# Workflow: New Feature (The Builder)
1. **Contract**: Define the interface and requirements. Create an implementation plan.
2. **Atomic**: Build small, testable components. Start with the "View" (Presentational) components.
3. **Integration**: Connect the components to the "Container" (Logic) and integrate with the rest of the app.
4. **Test**: Verify the feature with tests (Unit/E2E) as appropriate.
`,

  '.agent/workflows/ingest-monolith.md': `---
description: Legacy code ingestion workflow
---
# Workflow: Ingest Monolith (The Migrator)
1. **Decompose**: Break down the legacy code into smaller, manageable chunks.
2. **Atomize**: Convert the chunks into atomic components (View/Container).
3. **Verify**: Ensure the new components work as expected and match the original functionality.
`,

  '.agent/workflows/fix-component.md': `---
description: Component fix workflow
---
# Workflow: Fix Component (The Fixer)
1. **Scope**: Identify the scope of the issue and the affected component.
2. **Fix**: Apply the fix to the component.
3. **Verify**: Verify the fix with tests or manual verification.
`,

  '.agent/workflows/debug-test.md': `---
description: Debugging workflow
---
# Workflow: Debug Test (The Detective)
1. **Analyze Evidence**: Look at logs, error messages, and failing tests.
2. **Hypothesize**: Formulate a hypothesis about the cause of the issue.
3. **Fix**: Implement a minimal fix to test the hypothesis.
4. **Verify**: Run tests to verify the fix.
`,

  '.agent/workflows/optimize-module.md': `---
description: Optimization workflow
---
# Workflow: Optimize Module (The Tuner)
1. **Audit**: Analyze the module for performance, accessibility, or code quality issues.
2. **Refactor**: Apply optimizations and refactoring techniques.
3. **Verify**: Ensure no regressions were introduced.
`,

  '.agent/workflows/e2e-verify.md': `---
description: E2E verification workflow
---
# Workflow: E2E Verify (The Tester)
1. **Browser-in-the-loop**: Use the browser tool to manually verify the UI and user flows.
2. **Paranoid Playwright**: Write robust E2E tests that wait for elements and handle loading states.
`,

  '.agent/workflows/update-docs.md': `---
description: Documentation update workflow
---
# Workflow: Update Documentation
**Trigger:** Run this after finishing a feature or refactor.

**Step 1: Re-Index Components**
1.  Scan \`src/components/\` recursively.
2.  Update \`docs/component_glossary.md\`.
    * Add any new components found.
    * Remove any deleted components.
    * Update "Key Props" if interfaces changed.

**Step 2: Re-Map Dependencies**
1.  Scan for all \`import\` statements.
2.  Update \`docs/architecture/current_dependency_graph.md\`.
    * Ensure the Mermaid.js graph accurately reflects the new structure.
    * **Constraint:** Group nodes by directory (e.g., \`subgraph Views\`, \`subgraph UI\`).

**Step 3: Commit**
1.  \`git add docs/\`
2.  \`git commit -m "docs: sync architecture maps with code"\`
`,

  '.agent/workflows/deploy-prep.md': `---
description: Deployment preparation workflow
---
# Workflow: Production Gatekeeper (Pre-Deploy)
**Trigger:** Run this before running \`netlify deploy\` or pushing to the production branch.

**Step 1: The "Clean" Build**
1.  **Purge:** Delete the existing \`dist/\` (or \`build/\`) folder.
2.  **Build:** Run \`npm run build\`.
3.  **Analysis:** If the build fails, STOP. Analyze the error (usually strict linting or missing types).

**Step 1.4: Security Check**
1.  Run \`npm audit --audit-level=high\`.
2.  **Constraint:** If High vulnerabilities exist, deployment fails.
3.  Check for \`.env\` files in the commit history.

**Step 2: Production Preview (Crucial)**
1.  Run \`npm run preview\` (or \`npx vite preview\`).
2.  **Action:** The Agent must open the preview URL with Playwright or ask the user to verify manually.
3.  **Check:** Does the "Breadcrumb" feature work in this optimized build?

**Step 3: Netlify Compliance Check**
1.  **SPA Routing:** Check if \`public/_redirects\` or \`netlify.toml\` exists.
2.  **Environment Variables:** Scan code for \`process.env\` or \`import.meta.env\`.

**Step 4: Asset Audit**
1.  Check the size of the generated \`dist/\` folder.
2.  **Warning:** If any single JS chunk is > 500kb, recommend lazy loading.
`,

  '.agent/workflows/security-audit.md': `---
description: Security audit workflow
---
# Workflow: Security Audit (DevSecOps)
**Trigger:** Run this before a major merge or deployment.

**Step 1: Dependency Scan (SCA)**
1.  Run \`npm audit\`.
2.  **Analysis:**
    * **Critical/High:** STOP. Must fix immediately.
    * **Moderate/Low:** Log them, but proceed if necessary.

**Step 2: Static Code Analysis (SAST)**
1.  **Secret Hunt:** Grep the codebase for patterns like \`key=\`, \`token=\`, \`password=\`, \`sk_\`.
    * **Constraint:** Ignore \`.env\` files and \`dist/\`.
2.  **Injection Hunt:** Search for usage of:
    * \`dangerouslySetInnerHTML\`
    * \`eval()\`
    * Unsanitized URL params passed to \`fetch\`.

**Step 3: Configuration Audit**
1.  **Git Safety:** Check \`.gitignore\`.
2.  **Headers:** Check \`netlify.toml\` or server config.

**Step 4: Report**
1.  Output a "Security Health Score" (A-F).
2.  List required fixes.
`,

  '.agent/workflows/ci-setup.md': `---
description: CI/CD setup workflow
---
# Workflow: CI/CD Pipeline Generator (GitHub Actions)
**Trigger:** Use once to automate testing and deployment in the cloud.

**Step 1: Pipeline Definition**
Create \`.github/workflows/main.yml\`.

**Step 2: Job Structure**
1.  **Trigger:** On \`push\` to \`main\` and \`pull_request\`.
2.  **Environment:** \`ubuntu-latest\` with Node 20.
3.  **Job 1: Integrity:**
    * \`npm ci\`
    * \`npm run lint\`
    * \`npm test\`
4.  **Job 2: Verification (E2E):**
    * Install Playwright Browsers.
    * \`npx playwright test\`
5.  **Job 3: Build:**
    * \`npm run build\`.

**Step 3: Output**
1.  Explain to the user how to see the "Actions" tab in GitHub.
`,

  '.vscode/launch.json': JSON.stringify({
    "version": "0.2.0",
    "configurations": [
      {
        "type": "chrome",
        "request": "launch",
        "name": "Debug Client",
        "url": "http://localhost:5173",
        "webRoot": "${workspaceFolder}"
      },
      {
        "type": "node",
        "request": "launch",
        "name": "Debug Tests",
        "program": "${workspaceFolder}/node_modules/@playwright/test/cli.js",
        "args": [
          "test"
        ],
        "console": "integratedTerminal"
      }
    ]
  }, null, 2),

  'scripts/auto-doc.js': `const fs = require('fs');
const path = require('path');

const scanComponents = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanComponents(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
};

const generateGlossary = () => {
  const components = scanComponents(path.join(process.cwd(), 'src/components'));
  let content = '# Component Glossary\\n\\n';
  components.forEach(file => {
    const name = path.basename(file, path.extname(file));
    content += \`- **\${name}**: [Path](\${file})\\n\`;
  });
  
  const docPath = path.join(process.cwd(), 'docs/component_glossary.md');
  fs.mkdirSync(path.dirname(docPath), { recursive: true });
  fs.writeFileSync(docPath, content);
  console.log('Generated Component Glossary');
};

generateGlossary();
// Note: Dependency graph generation is complex and omitted for brevity in this bootstrap script.
`
};

Object.entries(files).forEach(([filePath, content]) => {
  writeFile(path.join(process.cwd(), filePath), content);
});

// Update package.json
const pkgPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.docs = "node scripts/auto-doc.js";
  pkg.scripts["test:e2e"] = "playwright test";

  pkg.devDependencies = pkg.devDependencies || {};
  pkg.devDependencies["eslint-plugin-security"] = "^3.0.0";

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('Updated package.json');
}
