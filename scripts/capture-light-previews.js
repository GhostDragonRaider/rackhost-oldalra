const { chromium } = require("playwright");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = {
  1: path.join(ROOT, "public/projects/project-1/preview.png"),
  2: path.join(ROOT, "public/projects/project-2/preview.png"),
  3: path.join(ROOT, "public/projects/project-3/preview.png"),
};
const BASE = "http://127.0.0.1:3010";

async function shot(page, file) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: file,
    type: "png",
    fullPage: false,
  });
  console.log("wrote", file);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  // Project 1 — no theme toggle; force a light chrome for the preview capture
  {
    const page = await context.newPage();
    await page.goto(`${BASE}/projects/project-1/project-1.html`, {
      waitUntil: "networkidle",
    });
    await page.addStyleTag({
      content: `
        :root {
          --ink: #f4f1ea !important;
          --ink-deep: #f7f4ed !important;
          --fog: #1a2330 !important;
          --fog-muted: #4a5565 !important;
          --fog-dim: #5c6b7a !important;
          --steel: #5a6b7c !important;
          --steel-bright: #2c3a4a !important;
          --glass: rgba(255, 252, 245, 0.82) !important;
          --line: rgba(26, 35, 48, 0.12) !important;
        }
        body {
          background-color: #f7f4ed !important;
          background-image:
            linear-gradient(180deg, rgba(247,244,237,0.72), rgba(247,244,237,0.55)),
            url(https://images.pexels.com/photos/2326876/pexels-photo-2326876.jpeg?auto=compress&cs=tinysrgb&w=1920) !important;
        }
        body::before, body::after { opacity: 0.25 !important; }
        header {
          background: rgba(255, 252, 245, 0.9) !important;
          border-bottom-color: rgba(26,35,48,0.1) !important;
        }
        .hero-title, header h1 { color: #1a2330 !important; -webkit-text-fill-color: #1a2330 !important; }
        .hero-subtitle { color: #3d4a58 !important; }
        nav a { color: #3d4a58 !important; }
      `,
    });
    await shot(page, OUT[1]);
    await page.close();
  }

  // Project 2 — click Világos / set light theme
  {
    const page = await context.newPage();
    await page.addInitScript(() => {
      try {
        localStorage.setItem("booking_color_mode", "light");
      } catch {}
    });
    await page.goto(`${BASE}/projects/project-2/`, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      try {
        localStorage.setItem("booking_color_mode", "light");
      } catch {}
    });
    // If still dark, click theme toggle in the top bar
    const toggle = page.locator('button[aria-label*="mód" i], button[title*="mód" i], button:has-text("Világos"), button:has-text("Light")').first();
    if (await toggle.count()) {
      const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      if (theme !== "light") {
        await toggle.click();
      }
    }
    await page.waitForTimeout(700);
    await shot(page, OUT[2]);
    await page.close();
  }

  // Project 3 — NovaDrive light theme via localStorage
  {
    const page = await context.newPage();
    await page.addInitScript(() => {
      try {
        localStorage.setItem("novadrive-theme", "light");
      } catch {}
    });
    await page.goto(`${BASE}/projects/project-3/`, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      try {
        localStorage.setItem("novadrive-theme", "light");
      } catch {}
    });
    const toggle = page.locator('button[aria-label="Világos mód"], button[title="Világos mód"]').first();
    if (await toggle.count()) {
      // If still dark (button says Világos), click to switch
      const label = await toggle.getAttribute("aria-label");
      if (label && label.includes("Világos")) {
        await toggle.click();
      }
    }
    await page.waitForTimeout(600);
    await shot(page, OUT[3]);
    await page.close();
  }

  await browser.close();
  console.log("done");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
