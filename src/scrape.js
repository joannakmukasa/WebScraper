"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer_1 = require("puppeteer");
var fs = require("fs/promises"); // File system module to write to a file
var readline = require("readline"); // Module for reading input from the console
var url_1 = require("url"); // Node.js URL module for URL manipulation
function scrapePageContent(url, baseDomain, visited, outputFilePath, linksFilePath) {
    return __awaiter(this, void 0, void 0, function () {
        var browser, page, _a, pageContent, links, _i, links_1, link, linkDomain, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, puppeteer_1.default.launch({ headless: true })];
                case 1:
                    browser = _b.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _b.sent();
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 13, 14, 16]);
                    if (visited.has(url)) {
                        return [2 /*return*/]; // Skip already visited URLs
                    }
                    visited.add(url); // Mark this URL as visited
                    console.log("Navigating to ".concat(url, "..."));
                    return [4 /*yield*/, page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })];
                case 4:
                    _b.sent();
                    console.log('Extracting page content and links...');
                    return [4 /*yield*/, page.evaluate(function () {
                            var pageContent = document.body.innerText;
                            var links = Array.from(document.querySelectorAll('a'))
                                .map(function (anchor) { return anchor.href; })
                                .filter(function (href) { return href && href.startsWith('http'); }); // Filter out any empty hrefs and keep only absolute URLs
                            return { pageContent: pageContent, links: links };
                        })];
                case 5:
                    _a = _b.sent(), pageContent = _a.pageContent, links = _a.links;
                    console.log('Saving content to file...');
                    return [4 /*yield*/, fs.appendFile(outputFilePath, "Content from ".concat(url, ":\n").concat(pageContent, "\n\n"), 'utf-8')];
                case 6:
                    _b.sent();
                    console.log("Content saved to ".concat(outputFilePath));
                    console.log('Saving links to file...');
                    return [4 /*yield*/, fs.appendFile(linksFilePath, links.join('\n') + '\n', 'utf-8')];
                case 7:
                    _b.sent();
                    console.log("Links saved to ".concat(linksFilePath));
                    _i = 0, links_1 = links;
                    _b.label = 8;
                case 8:
                    if (!(_i < links_1.length)) return [3 /*break*/, 12];
                    link = links_1[_i];
                    linkDomain = new url_1.URL(link).hostname;
                    if (!(linkDomain === baseDomain)) return [3 /*break*/, 10];
                    return [4 /*yield*/, scrapePageContent(link, baseDomain, visited, outputFilePath, linksFilePath)];
                case 9:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 10:
                    console.log("Skipping link outside base domain: ".concat(link));
                    _b.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 8];
                case 12: return [3 /*break*/, 16];
                case 13:
                    error_1 = _b.sent();
                    console.error('An error occurred during scraping:', error_1);
                    return [3 /*break*/, 16];
                case 14:
                    console.log('Closing browser...');
                    return [4 /*yield*/, browser.close()];
                case 15:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 16: return [2 /*return*/];
            }
        });
    });
}
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question('Please enter the URL to scrape: ', function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var outputFilePath, linksFilePath, visited, baseDomain;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                outputFilePath = 'output.txt';
                linksFilePath = 'links.txt';
                visited = new Set();
                baseDomain = new url_1.URL(url).hostname;
                console.log("Starting scrape for ".concat(url, "..."));
                return [4 /*yield*/, scrapePageContent(url, baseDomain, visited, outputFilePath, linksFilePath)];
            case 1:
                _a.sent();
                rl.close();
                return [2 /*return*/];
        }
    });
}); });
