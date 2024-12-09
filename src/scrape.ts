import puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as readline from 'readline';
import { URL } from 'url';
import TurndownService from 'turndown';



// Type definitions for the scrapePageContent function
async function scrapePageContent(
  url: string, 
  baseDomain: string, 
  visited: Set<string>, 
  outputFilePath: string, 
  linksFilePath: string, 
  depth: number, 
  maxDepth: number 
): Promise<void> {
  if (depth > maxDepth) {
    console.log(`Maximum depth reached for ${url}. Skipping further scraping.`);
    return;
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    if (visited.has(url)) {
      return; // Skip already visited URLs
    }

    visited.add(url); // Mark this URL as visited
    console.log(`Navigating to ${url} (Depth: ${depth})...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Extracting page content and links...');
    const { pageContent, links }: { pageContent: string; links: string[] } = await page.evaluate(() => {
      const pageContent = document.body.innerHTML; // Extract the full HTML
      const links = Array.from(document.querySelectorAll('a'))
        .map((anchor) => anchor.href)
        .filter((href) => href && href.startsWith('http')); // Filter out empty hrefs and keep only absolute URLs

      return { pageContent, links };
    });

    console.log('Converting HTML to Markdown...');
    const turndownService = new TurndownService();
    const markdownContent: string = turndownService.turndown(pageContent);

    console.log('Saving content to file...');
    await fs.appendFile(
      outputFilePath,
      `## Content from ${url}\n\n${markdownContent}\n\n`,
      'utf-8'
    );
    console.log(`Content saved to ${outputFilePath}`);

    console.log('Saving links to file...');
    await fs.appendFile(
      linksFilePath,
      `## Links from ${url}\n\n${links.map((link) => `- [${link}](${link})`).join('\n')}\n\n`,
      'utf-8'
    );
    console.log(`Links saved to ${linksFilePath}`);

    // Recursively scrape each link found on the page
    for (const link of links) {
      const linkDomain: string = new URL(link).hostname; // Get the domain from the link
      if (linkDomain === baseDomain) { // Check if the link belongs to the same domain
        await scrapePageContent(link, baseDomain, visited, outputFilePath, linksFilePath, depth + 1, maxDepth);
      } else {
        console.log(`Skipping link outside base domain: ${link}`);
      }
    }
  } catch (error) {
    console.error('An error occurred during scraping:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

// Create a readline interface for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Please enter the URL to scrape: ', async (url: string) => {
  const outputFilePath: string = 'output.md'; 
  const linksFilePath: string = 'links.md'; 
  const visited: Set<string> = new Set<string>(); // Track visited URLs
  const maxDepth: number = 2; 

  // Extract the base domain from the input URL
  const baseDomain: string = new URL(url).hostname;

  console.log(`Starting scrape for ${url}...`);
  await scrapePageContent(url, baseDomain, visited, outputFilePath, linksFilePath, 0, maxDepth); 
  
  rl.close();
});
