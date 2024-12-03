import puppeteer from 'puppeteer';
import * as fs from 'fs/promises'; // File system module to write to a file
import * as readline from 'readline'; // Module for reading input from the console
import { URL } from 'url'; // Node.js URL module for URL manipulation

async function scrapePageContent(url: string, baseDomain: string, visited: Set<string>, outputFilePath: string, linksFilePath: string): Promise<void> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    if (visited.has(url)) {
      return; // Skip already visited URLs
    }

    visited.add(url); // Mark this URL as visited
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Extracting page content and links...');
    const { pageContent, links } = await page.evaluate(() => {
      const pageContent = document.body.innerText;
      const links = Array.from(document.querySelectorAll('a'))
        .map(anchor => anchor.href)
        .filter(href => href && href.startsWith('http')); // Filter out any empty hrefs and keep only absolute URLs

      return { pageContent, links };
    });

    console.log('Saving content to file...');
    await fs.appendFile(outputFilePath, `Content from ${url}:\n${pageContent}\n\n`, 'utf-8');
    console.log(`Content saved to ${outputFilePath}`);

    console.log('Saving links to file...');
    await fs.appendFile(linksFilePath, links.join('\n') + '\n', 'utf-8');
    console.log(`Links saved to ${linksFilePath}`);

    // Recursively scrape each link found on the page
    for (const link of links) {
      const linkDomain = new URL(link).hostname; // Get the domain from the link
      if (linkDomain === baseDomain) { // Check if the link belongs to the same domain
        await scrapePageContent(link, baseDomain, visited, outputFilePath, linksFilePath);
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter the URL to scrape: ', async (url) => {
  const outputFilePath = 'output.txt'; 
  const linksFilePath = 'links.txt'; 
  const visited = new Set<string>(); // Track visited URLs

  // Extract the base domain from the input URL
  const baseDomain = new URL(url).hostname;

  console.log(`Starting scrape for ${url}...`);
  await scrapePageContent(url, baseDomain, visited, outputFilePath, linksFilePath);
  
  rl.close();
});