import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';

/**
 * UI VISION DIAGNOSTIC TEST - VERBOSE MODE
 *
 * This test provides comprehensive visual and functional diagnostics for the PoolParty UI.
 * It captures detailed information about:
 * - Layout structure and column alignment
 * - Typography and text rendering
 * - Color scheme and theming
 * - Interactive elements (sorting, filtering, buttons)
 * - Spacing and visual consistency
 * - Responsive behavior
 *
 * Output includes:
 * - Detailed console logs with measurements
 * - Multiple screenshots at different states
 * - HTML structure dumps
 * - CSS computed style reports
 */

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const DIAGNOSTIC_OUTPUT = path.join(__dirname, 'diagnostic-output.json');
const ZIP_OUTPUT = path.join(__dirname, 'ui-diagnostics.zip');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Function to create zip of all diagnostics
function createDiagnosticsZip() {
  console.log('\n📦 Creating diagnostics zip file...\n');

  const zip = new AdmZip();

  // Add all screenshots
  if (fs.existsSync(SCREENSHOTS_DIR)) {
    const files = fs.readdirSync(SCREENSHOTS_DIR);
    files.forEach(file => {
      const filePath = path.join(SCREENSHOTS_DIR, file);
      zip.addLocalFile(filePath);
      console.log(`  Added: ${file}`);
    });
  }

  // Add diagnostic JSON output
  if (fs.existsSync(DIAGNOSTIC_OUTPUT)) {
    zip.addLocalFile(DIAGNOSTIC_OUTPUT);
    console.log(`  Added: diagnostic-output.json`);
  }

  // Create a summary text file
  const summary = `
PoolParty UI Diagnostics Report
Generated: ${new Date().toISOString()}

Contents:
- Multiple screenshots showing UI state at different interactions
- diagnostic-output.json: Complete diagnostic data in JSON format

Screenshots included:
${fs.existsSync(SCREENSHOTS_DIR) ? fs.readdirSync(SCREENSHOTS_DIR).map(f => `  - ${f}`).join('\n') : '  (none)'}

To analyze:
1. Extract all files from this zip
2. Review screenshots for visual issues
3. Check diagnostic-output.json for detailed measurements

Key areas to review:
- Table column alignment and spacing
- Color scheme (Pool Party aqua theme)
- Typography and text overflow
- Interactive elements (buttons, sorting)
- Layout consistency across viewports
`;

  zip.addFile('README.txt', Buffer.from(summary, 'utf8'));
  console.log(`  Added: README.txt`);

  // Write zip file
  zip.writeZip(ZIP_OUTPUT);
  console.log(`\n✅ Diagnostics zip created: ${ZIP_OUTPUT}\n`);
  console.log(`📊 Total files: ${zip.getEntries().length}`);
  console.log(`📦 Zip size: ${(fs.statSync(ZIP_OUTPUT).size / 1024).toFixed(2)} KB\n`);

  return ZIP_OUTPUT;
}

const mockPools = [
  {
    id: '0xpool1',
    chain: 'ethereum',
    token0: { symbol: 'WETH', name: 'Wrapped Ether' },
    token1: { symbol: 'USDC', name: 'USD Coin' },
    fee_tier: 500,
    tvl_usd: 10000000,
    volume_usd_24h: 5000000,
    updated_at: new Date().toISOString(),
  },
  {
    id: '0xpool2',
    chain: 'ethereum',
    token0: { symbol: 'DAI', name: 'Dai Stablecoin' },
    token1: { symbol: 'USDT', name: 'Tether USD' },
    fee_tier: 100,
    tvl_usd: 8000000,
    volume_usd_24h: 2000000,
    updated_at: new Date().toISOString(),
  },
  {
    id: '0xpool3',
    chain: 'ethereum',
    token0: { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
    token1: { symbol: 'ETH', name: 'Ethereum' },
    fee_tier: 3000,
    tvl_usd: 15000000,
    volume_usd_24h: 7500000,
    updated_at: new Date().toISOString(),
  },
];

async function captureDetailedDiagnostics(page: Page, testName: string) {
  console.log('\n' + '='.repeat(80));
  console.log(`🔍 DIAGNOSTIC REPORT: ${testName}`);
  console.log('='.repeat(80) + '\n');

  const diagnostics: any = {
    testName,
    timestamp: new Date().toISOString(),
    url: page.url(),
    viewport: await page.viewportSize(),
    sections: {},
  };

  // Capture screenshot
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${testName.replace(/\s+/g, '-')}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot saved: ${screenshotPath}\n`);
  diagnostics.screenshot = screenshotPath;

  return diagnostics;
}

async function analyzeTableStructure(page: Page) {
  console.log('📊 TABLE STRUCTURE ANALYSIS\n');

  const tableExists = await page.locator('table').count() > 0;
  console.log(`Table exists: ${tableExists}`);

  if (!tableExists) {
    console.log('❌ NO TABLE FOUND - Critical layout issue!\n');
    return { error: 'No table found' };
  }

  // Get table dimensions and properties
  const tableInfo = await page.locator('table').first().evaluate((table) => {
    const rect = table.getBoundingClientRect();
    const styles = window.getComputedStyle(table);
    return {
      dimensions: {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      },
      styles: {
        display: styles.display,
        tableLayout: styles.tableLayout,
        borderCollapse: styles.borderCollapse,
        width: styles.width,
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
      },
    };
  });

  console.log('Table Dimensions:', JSON.stringify(tableInfo.dimensions, null, 2));
  console.log('Table Styles:', JSON.stringify(tableInfo.styles, null, 2));

  // Analyze column headers
  const headers = await page.locator('thead th, thead td').evaluateAll((cells) => {
    return cells.map((cell, index) => {
      const rect = cell.getBoundingClientRect();
      const styles = window.getComputedStyle(cell);
      return {
        index,
        text: cell.textContent?.trim(),
        width: rect.width,
        height: rect.height,
        textAlign: styles.textAlign,
        padding: styles.padding,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontWeight: styles.fontWeight,
        fontSize: styles.fontSize,
        position: { x: rect.left, y: rect.top },
      };
    });
  });

  console.log(`\n📋 COLUMN HEADERS (${headers.length} found):`);
  headers.forEach((header, i) => {
    console.log(`\n  Column ${i + 1}:`);
    console.log(`    Text: "${header.text}"`);
    console.log(`    Width: ${header.width.toFixed(2)}px`);
    console.log(`    Alignment: ${header.textAlign}`);
    console.log(`    Font: ${header.fontSize} / ${header.fontWeight}`);
    console.log(`    Colors: bg=${header.backgroundColor}, text=${header.color}`);
    console.log(`    Position: (${header.position.x.toFixed(2)}, ${header.position.y.toFixed(2)})`);
  });

  // Check for column alignment issues
  console.log('\n🔍 COLUMN ALIGNMENT CHECK:');
  const widths = headers.map(h => h.width);
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  const avgWidth = totalWidth / widths.length;
  const variance = widths.map(w => Math.abs(w - avgWidth));
  const maxVariance = Math.max(...variance);

  console.log(`  Total width: ${totalWidth.toFixed(2)}px`);
  console.log(`  Average column width: ${avgWidth.toFixed(2)}px`);
  console.log(`  Max variance from average: ${maxVariance.toFixed(2)}px`);

  if (maxVariance > 200) {
    console.log(`  ⚠️  WARNING: Large column width variance detected!`);
  }

  // Analyze table rows
  const rowCount = await page.locator('tbody tr').count();
  console.log(`\n📊 TABLE ROWS: ${rowCount} found`);

  if (rowCount > 0) {
    const firstRowCells = await page.locator('tbody tr').first().locator('td').evaluateAll((cells) => {
      return cells.map((cell, index) => {
        const rect = cell.getBoundingClientRect();
        const styles = window.getComputedStyle(cell);
        return {
          index,
          text: cell.textContent?.trim().substring(0, 50),
          width: rect.width,
          height: rect.height,
          textAlign: styles.textAlign,
          verticalAlign: styles.verticalAlign,
          padding: styles.padding,
          overflow: styles.overflow,
          textOverflow: styles.textOverflow,
          whiteSpace: styles.whiteSpace,
        };
      });
    });

    console.log(`\n📋 FIRST ROW CELLS (${firstRowCells.length} found):`);
    firstRowCells.forEach((cell, i) => {
      console.log(`\n  Cell ${i + 1}:`);
      console.log(`    Text: "${cell.text}"`);
      console.log(`    Width: ${cell.width.toFixed(2)}px`);
      console.log(`    Alignment: ${cell.textAlign} / ${cell.verticalAlign}`);
      console.log(`    Overflow: ${cell.overflow}, ${cell.textOverflow}, ${cell.whiteSpace}`);
    });

    // Check if header and row columns align
    console.log('\n🔍 HEADER-TO-ROW ALIGNMENT CHECK:');
    headers.forEach((header, i) => {
      const cell = firstRowCells[i];
      if (cell) {
        const widthDiff = Math.abs(header.width - cell.width);
        console.log(`  Column ${i + 1}: Header=${header.width.toFixed(2)}px, Cell=${cell.width.toFixed(2)}px, Diff=${widthDiff.toFixed(2)}px`);
        if (widthDiff > 5) {
          console.log(`    ⚠️  WARNING: Misalignment detected!`);
        }
      }
    });
  }

  return { tableInfo, headers, rowCount, firstRowCells: rowCount > 0 ? firstRowCells : [] };
}

async function analyzeColorScheme(page: Page) {
  console.log('\n🎨 COLOR SCHEME ANALYSIS\n');

  const colorScheme = await page.evaluate(() => {
    const rootStyles = window.getComputedStyle(document.documentElement);
    const bodyStyles = window.getComputedStyle(document.body);

    // Extract CSS variables
    const cssVars: Record<string, string> = {};
    const varNames = [
      '--primary', '--primary-rgb',
      '--secondary', '--secondary-rgb',
      '--accent', '--accent-rgb',
      '--foreground', '--foreground-rgb',
      '--background', '--background-rgb',
      '--surface', '--surface-rgb',
      '--border', '--border-rgb',
      '--aqua-primary', '--aqua-dark', '--aqua-light',
      '--coral', '--sun', '--lime',
      '--lifeguard-excellent', '--lifeguard-good', '--lifeguard-warning',
      '--lifeguard-danger', '--lifeguard-critical',
    ];

    varNames.forEach(varName => {
      const value = rootStyles.getPropertyValue(varName).trim();
      if (value) cssVars[varName] = value;
    });

    return {
      cssVariables: cssVars,
      body: {
        backgroundColor: bodyStyles.backgroundColor,
        color: bodyStyles.color,
        fontFamily: bodyStyles.fontFamily,
        fontSize: bodyStyles.fontSize,
        lineHeight: bodyStyles.lineHeight,
      },
    };
  });

  console.log('CSS Variables:');
  Object.entries(colorScheme.cssVariables).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  console.log('\nBody Styles:');
  console.log(`  Background: ${colorScheme.body.backgroundColor}`);
  console.log(`  Text Color: ${colorScheme.body.color}`);
  console.log(`  Font: ${colorScheme.body.fontSize} ${colorScheme.body.fontFamily}`);
  console.log(`  Line Height: ${colorScheme.body.lineHeight}`);

  // Check for Pool Party aqua theme
  console.log('\n🏊 POOL PARTY THEME CHECK:');
  const hasAquaVars = Object.keys(colorScheme.cssVariables).some(key => key.includes('aqua'));
  const hasLifeguardVars = Object.keys(colorScheme.cssVariables).some(key => key.includes('lifeguard'));
  const hasPoolColors = Object.keys(colorScheme.cssVariables).some(key =>
    key.includes('coral') || key.includes('sun') || key.includes('lime')
  );

  console.log(`  Aqua variables defined: ${hasAquaVars ? '✅' : '❌'}`);
  console.log(`  Lifeguard status colors defined: ${hasLifeguardVars ? '✅' : '❌'}`);
  console.log(`  Pool party accent colors (coral, sun, lime): ${hasPoolColors ? '✅' : '❌'}`);

  if (!hasAquaVars || !hasLifeguardVars || !hasPoolColors) {
    console.log('  ⚠️  WARNING: Pool Party theme not fully applied!');
  }

  return colorScheme;
}

async function analyzeSortingFunctionality(page: Page) {
  console.log('\n🔄 COLUMN SORTING ANALYSIS\n');

  const sortButtons = await page.locator('thead button, th[role="button"], [aria-sort]').all();
  console.log(`Found ${sortButtons.length} sortable column headers`);

  const sortingInfo = [];

  for (let i = 0; i < Math.min(sortButtons.length, 3); i++) {
    const button = sortButtons[i];
    const info = await button.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      return {
        text: el.textContent?.trim(),
        tag: el.tagName,
        ariaSort: el.getAttribute('aria-sort'),
        role: el.getAttribute('role'),
        cursor: styles.cursor,
        pointerEvents: styles.pointerEvents,
        position: { x: rect.left, y: rect.top },
        size: { width: rect.width, height: rect.height },
      };
    });

    console.log(`\nSort Button ${i + 1}:`);
    console.log(`  Text: "${info.text}"`);
    console.log(`  Element: <${info.tag}>`);
    console.log(`  ARIA Sort: ${info.ariaSort || 'not set'}`);
    console.log(`  Role: ${info.role || 'not set'}`);
    console.log(`  Cursor: ${info.cursor}`);
    console.log(`  Pointer Events: ${info.pointerEvents}`);
    console.log(`  Interactive: ${info.cursor === 'pointer' && info.pointerEvents !== 'none' ? '✅' : '❌'}`);

    sortingInfo.push(info);
  }

  // Test actual sorting functionality
  if (sortButtons.length > 0) {
    console.log('\n🧪 TESTING SORT FUNCTIONALITY:\n');

    // Get initial row order
    const getRowOrder = async () => {
      return await page.locator('tbody tr').evaluateAll((rows) => {
        return rows.map(row => row.textContent?.trim().substring(0, 100));
      });
    };

    const initialOrder = await getRowOrder();
    console.log('Initial row order (first 100 chars of each row):');
    initialOrder.forEach((row, i) => console.log(`  ${i + 1}. ${row}`));

    // Click first sort button
    console.log(`\n🖱️  Clicking first sort button...`);
    await sortButtons[0].click();
    await page.waitForTimeout(500);

    const afterFirstClick = await getRowOrder();
    console.log('\nRow order after first click:');
    afterFirstClick.forEach((row, i) => console.log(`  ${i + 1}. ${row}`));

    const orderChanged = JSON.stringify(initialOrder) !== JSON.stringify(afterFirstClick);
    console.log(`\nOrder changed: ${orderChanged ? '✅ YES' : '❌ NO'}`);

    if (!orderChanged) {
      console.log('⚠️  WARNING: Sorting appears to be non-functional!');
    }

    // Click again to test reverse sort
    console.log(`\n🖱️  Clicking again for reverse sort...`);
    await sortButtons[0].click();
    await page.waitForTimeout(500);

    const afterSecondClick = await getRowOrder();
    console.log('\nRow order after second click:');
    afterSecondClick.forEach((row, i) => console.log(`  ${i + 1}. ${row}`));

    const reversedCorrectly = JSON.stringify(afterFirstClick) !== JSON.stringify(afterSecondClick);
    console.log(`\nReverse sort working: ${reversedCorrectly ? '✅ YES' : '❌ NO'}`);

    return { sortingInfo, functionalityTest: { orderChanged, reversedCorrectly } };
  }

  return { sortingInfo, functionalityTest: null };
}

async function analyzeTypography(page: Page) {
  console.log('\n📝 TYPOGRAPHY ANALYSIS\n');

  const typography = await page.evaluate(() => {
    const elements = {
      h1: document.querySelector('h1'),
      h2: document.querySelector('h2'),
      h3: document.querySelector('h3'),
      paragraph: document.querySelector('p'),
      tableHeader: document.querySelector('thead th, thead td'),
      tableCell: document.querySelector('tbody td'),
      button: document.querySelector('button'),
      link: document.querySelector('a'),
    };

    const results: Record<string, any> = {};

    Object.entries(elements).forEach(([key, element]) => {
      if (element) {
        const styles = window.getComputedStyle(element);
        results[key] = {
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          fontFamily: styles.fontFamily,
          lineHeight: styles.lineHeight,
          letterSpacing: styles.letterSpacing,
          color: styles.color,
          textOverflow: styles.textOverflow,
          whiteSpace: styles.whiteSpace,
          wordBreak: styles.wordBreak,
        };
      }
    });

    return results;
  });

  Object.entries(typography).forEach(([element, styles]) => {
    console.log(`\n${element.toUpperCase()}:`);
    Object.entries(styles).forEach(([prop, value]) => {
      console.log(`  ${prop}: ${value}`);
    });
  });

  // Check for text overflow issues
  const overflowElements = await page.locator('*').evaluateAll((elements) => {
    return elements
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return el.scrollWidth > rect.width || el.scrollHeight > rect.height;
      })
      .slice(0, 10) // Limit to first 10
      .map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 50),
        scrollWidth: el.scrollWidth,
        clientWidth: el.getBoundingClientRect().width,
        overflow: window.getComputedStyle(el).overflow,
      }));
  });

  if (overflowElements.length > 0) {
    console.log('\n⚠️  TEXT OVERFLOW DETECTED:');
    overflowElements.forEach((el, i) => {
      console.log(`\n  Element ${i + 1}:`);
      console.log(`    Tag: <${el.tag}>`);
      console.log(`    Text: "${el.text}"`);
      console.log(`    Content width: ${el.scrollWidth}px, Container width: ${el.clientWidth}px`);
      console.log(`    Overflow: ${el.overflow}`);
    });
  } else {
    console.log('\n✅ No text overflow issues detected');
  }

  return { typography, overflowElements };
}

async function analyzeSpacingAndLayout(page: Page) {
  console.log('\n📐 SPACING & LAYOUT ANALYSIS\n');

  const spacing = await page.evaluate(() => {
    const rootStyles = window.getComputedStyle(document.documentElement);
    const spacingVars: Record<string, string> = {};

    // Check for spacing scale variables
    for (let i = 1; i <= 8; i++) {
      const value = rootStyles.getPropertyValue(`--spacing-${i}`).trim();
      if (value) spacingVars[`--spacing-${i}`] = value;
    }

    // Check container padding/margin
    const container = document.querySelector('main, [class*="container"]');
    let containerStyles = null;
    if (container) {
      const styles = window.getComputedStyle(container);
      containerStyles = {
        padding: styles.padding,
        margin: styles.margin,
        maxWidth: styles.maxWidth,
        width: styles.width,
      };
    }

    return { spacingVars, containerStyles };
  });

  console.log('Spacing Scale Variables:');
  if (Object.keys(spacing.spacingVars).length > 0) {
    Object.entries(spacing.spacingVars).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  } else {
    console.log('  ⚠️  WARNING: No spacing scale variables found (expected --spacing-1 through --spacing-8)');
  }

  if (spacing.containerStyles) {
    console.log('\nMain Container:');
    Object.entries(spacing.containerStyles).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  }

  // Check for layout shift elements
  const floatingElements = await page.locator('*').evaluateAll((elements) => {
    return elements
      .filter((el) => {
        const styles = window.getComputedStyle(el);
        return styles.position === 'absolute' || styles.position === 'fixed' || styles.float !== 'none';
      })
      .slice(0, 20)
      .map((el) => {
        const styles = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          class: el.className,
          position: styles.position,
          float: styles.float,
          top: styles.top,
          left: styles.left,
          zIndex: styles.zIndex,
          size: { width: rect.width, height: rect.height },
        };
      });
  });

  console.log(`\n🎈 FLOATING/POSITIONED ELEMENTS (${floatingElements.length} found):`);
  floatingElements.forEach((el, i) => {
    console.log(`\n  Element ${i + 1}:`);
    console.log(`    Tag: <${el.tag}> class="${el.class}"`);
    console.log(`    Position: ${el.position}, Float: ${el.float}`);
    console.log(`    Coordinates: top=${el.top}, left=${el.left}, z-index=${el.zIndex}`);
    console.log(`    Size: ${el.size.width.toFixed(2)}px × ${el.size.height.toFixed(2)}px`);
  });

  return { spacing, floatingElements };
}

async function analyzeInteractiveElements(page: Page) {
  console.log('\n🖱️  INTERACTIVE ELEMENTS ANALYSIS\n');

  const buttons = await page.locator('button').evaluateAll((btns) => {
    return btns.slice(0, 10).map((btn) => {
      const styles = window.getComputedStyle(btn);
      const rect = btn.getBoundingClientRect();
      return {
        text: btn.textContent?.trim(),
        disabled: btn.hasAttribute('disabled'),
        ariaLabel: btn.getAttribute('aria-label'),
        cursor: styles.cursor,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: styles.border,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        fontSize: styles.fontSize,
        minHeight: rect.height,
      };
    });
  });

  console.log(`BUTTONS (${buttons.length} analyzed):`);
  buttons.forEach((btn, i) => {
    console.log(`\n  Button ${i + 1}:`);
    console.log(`    Text: "${btn.text}"`);
    console.log(`    Disabled: ${btn.disabled}`);
    console.log(`    ARIA Label: ${btn.ariaLabel || 'none'}`);
    console.log(`    Cursor: ${btn.cursor}`);
    console.log(`    Colors: bg=${btn.backgroundColor}, text=${btn.color}`);
    console.log(`    Border: ${btn.border}`);
    console.log(`    Padding: ${btn.padding}`);
    console.log(`    Min Height: ${btn.minHeight.toFixed(2)}px`);

    if (btn.minHeight < 44) {
      console.log(`    ⚠️  WARNING: Touch target too small (WCAG requires 44px minimum)`);
    }
  });

  // Analyze inputs
  const inputs = await page.locator('input').evaluateAll((inputs) => {
    return inputs.slice(0, 5).map((input) => {
      const styles = window.getComputedStyle(input);
      const rect = input.getBoundingClientRect();
      return {
        type: input.getAttribute('type'),
        placeholder: input.getAttribute('placeholder'),
        ariaLabel: input.getAttribute('aria-label'),
        height: rect.height,
        padding: styles.padding,
        border: styles.border,
        borderRadius: styles.borderRadius,
        fontSize: styles.fontSize,
      };
    });
  });

  if (inputs.length > 0) {
    console.log(`\n\nINPUTS (${inputs.length} analyzed):`);
    inputs.forEach((input, i) => {
      console.log(`\n  Input ${i + 1}:`);
      console.log(`    Type: ${input.type}`);
      console.log(`    Placeholder: "${input.placeholder}"`);
      console.log(`    ARIA Label: ${input.ariaLabel || 'none'}`);
      console.log(`    Height: ${input.height.toFixed(2)}px`);
      console.log(`    Border: ${input.border}`);
      console.log(`    Padding: ${input.padding}`);
    });
  }

  return { buttons, inputs };
}

async function captureHTMLStructure(page: Page) {
  console.log('\n📄 HTML STRUCTURE CAPTURE\n');

  const structure = await page.evaluate(() => {
    const getElementInfo = (el: Element, depth: number = 0): any => {
      if (depth > 3) return null; // Limit depth

      return {
        tag: el.tagName,
        class: el.className,
        id: el.id,
        children: Array.from(el.children).slice(0, 5).map(child => getElementInfo(child, depth + 1)).filter(Boolean),
      };
    };

    return {
      body: getElementInfo(document.body),
      main: document.querySelector('main') ? getElementInfo(document.querySelector('main')!) : null,
    };
  });

  const printTree = (node: any, indent: string = '') => {
    if (!node) return;
    const identifier = node.id ? `#${node.id}` : node.class ? `.${node.class.split(' ')[0]}` : '';
    console.log(`${indent}<${node.tag}${identifier}>`);
    if (node.children) {
      node.children.forEach((child: any) => printTree(child, indent + '  '));
    }
  };

  console.log('MAIN STRUCTURE:');
  if (structure.main) {
    printTree(structure.main);
  } else {
    console.log('⚠️  No <main> element found');
    console.log('\nBODY STRUCTURE (first 3 levels):');
    printTree(structure.body);
  }

  return structure;
}

// ============================================================================
// MAIN DIAGNOSTIC TESTS
// ============================================================================

test.describe('🔍 UI Vision Diagnostic Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API with multiple pools for better testing
    await page.route('**/api/pools*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockPools,
          meta: { total: mockPools.length, page: 1, limit: 10 },
        }),
      });
    });

    console.log('\n🌊 Loading PoolParty Dashboard...\n');
    await page.goto('/');
    await page.waitForTimeout(2000); // Give time for rendering
  });

  test.afterAll(async () => {
    // Create zip of all screenshots and diagnostics after all tests complete
    console.log('\n' + '='.repeat(80));
    console.log('🎬 ALL TESTS COMPLETE - Packaging Diagnostics');
    console.log('='.repeat(80));

    const zipPath = createDiagnosticsZip();

    console.log('\n✨ DIAGNOSTICS PACKAGE READY FOR ANALYSIS');
    console.log('='.repeat(80));
    console.log(`\n📍 Location: ${zipPath}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Extract the zip file');
    console.log('   2. Review all screenshots for visual issues');
    console.log('   3. Check diagnostic-output.json for measurements');
    console.log('   4. Use findings to fix UI/UX issues\n');
    console.log('='.repeat(80) + '\n');
  });

  test('Complete Visual Diagnostic Scan', async ({ page }) => {
    const diagnostics = await captureDetailedDiagnostics(page, 'complete-visual-scan');

    // Run all diagnostic modules
    diagnostics.sections.htmlStructure = await captureHTMLStructure(page);
    diagnostics.sections.colorScheme = await analyzeColorScheme(page);
    diagnostics.sections.tableStructure = await analyzeTableStructure(page);
    diagnostics.sections.typography = await analyzeTypography(page);
    diagnostics.sections.spacing = await analyzeSpacingAndLayout(page);
    diagnostics.sections.interactive = await analyzeInteractiveElements(page);
    diagnostics.sections.sorting = await analyzeSortingFunctionality(page);

    // Save diagnostic output to JSON
    fs.writeFileSync(DIAGNOSTIC_OUTPUT, JSON.stringify(diagnostics, null, 2));
    console.log(`\n💾 Full diagnostic report saved to: ${DIAGNOSTIC_OUTPUT}`);

    // Summary assessment
    console.log('\n' + '='.repeat(80));
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(80));

    const issues: string[] = [];

    // Check critical issues
    if (diagnostics.sections.tableStructure?.error) {
      issues.push('❌ CRITICAL: No table found on page');
    }

    if (diagnostics.sections.sorting?.functionalityTest && !diagnostics.sections.sorting.functionalityTest.orderChanged) {
      issues.push('❌ CRITICAL: Column sorting is not functional');
    }

    if (diagnostics.sections.colorScheme) {
      const scheme = diagnostics.sections.colorScheme;
      const hasAqua = Object.keys(scheme.cssVariables).some((k: string) => k.includes('aqua'));
      if (!hasAqua) {
        issues.push('⚠️  WARNING: Pool Party aqua theme not detected');
      }
    }

    if (diagnostics.sections.typography?.overflowElements?.length > 0) {
      issues.push(`⚠️  WARNING: ${diagnostics.sections.typography.overflowElements.length} elements with text overflow`);
    }

    if (diagnostics.sections.spacing?.floatingElements?.length > 10) {
      issues.push(`⚠️  INFO: ${diagnostics.sections.spacing.floatingElements.length} floating/positioned elements (possible layout issues)`);
    }

    if (issues.length === 0) {
      console.log('\n✅ No critical issues detected!\n');
    } else {
      console.log('\n🚨 ISSUES DETECTED:\n');
      issues.forEach(issue => console.log(`  ${issue}`));
      console.log('');
    }

    console.log('='.repeat(80) + '\n');
  });

  test('Table Column Alignment Detailed Test', async ({ page }) => {
    await captureDetailedDiagnostics(page, 'table-column-alignment');
    await analyzeTableStructure(page);

    // Take screenshot highlighting table
    await page.evaluate(() => {
      const table = document.querySelector('table');
      if (table) {
        (table as HTMLElement).style.outline = '3px solid red';
      }
    });

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'table-highlighted.png'),
      fullPage: true,
    });
    console.log('📸 Table highlighted screenshot saved');
  });

  test('Sorting Interaction Detailed Test', async ({ page }) => {
    await captureDetailedDiagnostics(page, 'sorting-before-interaction');

    const sortingResults = await analyzeSortingFunctionality(page);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'sorting-after-interaction.png'),
      fullPage: true,
    });

    console.log('\n📸 Post-sorting screenshot saved');

    // Assert that sorting is functional
    if (sortingResults.functionalityTest) {
      expect(sortingResults.functionalityTest.orderChanged).toBeTruthy();
      console.log('✅ Sorting functionality verified');
    }
  });

  test('Color Theme Validation Test', async ({ page }) => {
    await captureDetailedDiagnostics(page, 'color-theme-validation');
    const colorScheme = await analyzeColorScheme(page);

    // Verify Pool Party theme colors exist
    const requiredVars = ['--aqua-primary', '--lifeguard-excellent', '--coral', '--sun', '--lime'];
    const missingVars = requiredVars.filter(v => !colorScheme.cssVariables[v]);

    if (missingVars.length > 0) {
      console.log(`\n❌ Missing theme variables: ${missingVars.join(', ')}\n`);
    } else {
      console.log('\n✅ All Pool Party theme variables present\n');
    }

    expect(missingVars.length).toBe(0);
  });

  test('Responsive Layout Test', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1366, height: 768, name: 'desktop-medium' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' },
    ];

    for (const viewport of viewports) {
      console.log(`\n📱 Testing ${viewport.name} (${viewport.width}×${viewport.height})`);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);

      await captureDetailedDiagnostics(page, `responsive-${viewport.name}`);
      await analyzeTableStructure(page);

      console.log('─'.repeat(80));
    }
  });

  test('Interactive Elements Accessibility Test', async ({ page }) => {
    await captureDetailedDiagnostics(page, 'interactive-elements');
    const interactive = await analyzeInteractiveElements(page);

    // Check for WCAG touch target sizes
    const smallButtons = interactive.buttons.filter(b => b.minHeight < 44);
    if (smallButtons.length > 0) {
      console.log(`\n⚠️  ${smallButtons.length} buttons below WCAG minimum touch target (44px)\n`);
    }

    // Check for proper ARIA labels
    const unlabeledButtons = interactive.buttons.filter(b => !b.text && !b.ariaLabel);
    if (unlabeledButtons.length > 0) {
      console.log(`\n⚠️  ${unlabeledButtons.length} buttons without text or ARIA labels\n`);
    }
  });
});
