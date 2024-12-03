"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs = __importStar(require("fs/promises")); // File system module to write to a file
const readline = __importStar(require("readline")); // Module for reading input from the console
const url_1 = require("url"); // Node.js URL module for URL manipulation
function scrapePageContent(url, baseDomain, visited, outputFilePath, linksFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch({ headless: true });
        const page = yield browser.newPage();
        try {
            if (visited.has(url)) {
                return; // Skip already visited URLs
            }
            visited.add(url); // Mark this URL as visited
            console.log(`Navigating to ${url}...`);
            yield page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            console.log('Extracting page content and links...');
            const { pageContent, links } = yield page.evaluate(() => {
                const pageContent = document.body.innerText;
                const links = Array.from(document.querySelectorAll('a'))
                    .map(anchor => anchor.href)
                    .filter(href => href && href.startsWith('http')); // Filter out any empty hrefs and keep only absolute URLs
                return { pageContent, links };
            });
            console.log('Saving content to file...');
            yield fs.appendFile(outputFilePath, `Content from ${url}:\n${pageContent}\n\n`, 'utf-8');
            console.log(`Content saved to ${outputFilePath}`);
            console.log('Saving links to file...');
            yield fs.appendFile(linksFilePath, links.join('\n') + '\n', 'utf-8');
            console.log(`Links saved to ${linksFilePath}`);
            // Recursively scrape each link found on the page
            for (const link of links) {
                const linkDomain = new url_1.URL(link).hostname; // Get the domain from the link
                if (linkDomain === baseDomain) { // Check if the link belongs to the same domain
                    yield scrapePageContent(link, baseDomain, visited, outputFilePath, linksFilePath);
                }
                else {
                    console.log(`Skipping link outside base domain: ${link}`);
                }
            }
        }
        catch (error) {
            console.error('An error occurred during scraping:', error);
        }
        finally {
            console.log('Closing browser...');
            yield browser.close();
        }
    });
}
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question('Please enter the URL to scrape: ', (url) => __awaiter(void 0, void 0, void 0, function* () {
    const outputFilePath = 'output.txt';
    const linksFilePath = 'links.txt';
    const visited = new Set(); // Track visited URLs
    // Extract the base domain from the input URL
    const baseDomain = new url_1.URL(url).hostname;
    console.log(`Starting scrape for ${url}...`);
    yield scrapePageContent(url, baseDomain, visited, outputFilePath, linksFilePath);
    rl.close();
}));
