import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as puppeteer from 'puppeteer';

export interface DailyMedResponse {
  data: DailyMedProductInfo;
}

export interface DailyMedProductInfo {
  ndcCodes: string[];
  indications: string;
  lastUpdateDate: string;
}

@Injectable()
export class DailyMedService {
  private readonly baseUrl =
    'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm';
  private readonly searchUrl =
    'https://dailymed.nlm.nih.gov/dailymed/search.cfm';

  async getSetIdByDrugName(drugName: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage();
      // First navigate to the main DailyMed page
      await page.goto(this.baseUrl, {
        waitUntil: 'networkidle0',
      });

      // Fill in the search form using the correct selector
      await page.type('#searchQuery', drugName);

      // Submit the form and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('input.search[type="submit"]'),
      ]);

      // Wait for the search results to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if page exists
      const pageTitle = await page.title();
      if (pageTitle.includes('Error') || pageTitle.includes('Not Found')) {
        throw new NotFoundException(`No drug found with name: ${drugName}`);
      }

      // Get the current URL and extract setId
      const currentUrl = page.url();
      const setIdMatch = currentUrl.match(/setid=([^&]+)/);

      if (!setIdMatch) {
        throw new NotFoundException(`No drug found with name: ${drugName}`);
      }

      return setIdMatch[1];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error fetching drug information from DailyMed',
      );
    } finally {
      await browser.close();
    }
  }

  async getProductLabelingBySetId(setId: string): Promise<DailyMedProductInfo> {
    const browser = await puppeteer.launch({
      headless: false,
    });

    try {
      const page = await browser.newPage();
      await page.goto(`${this.baseUrl}?setid=${setId}`, {
        waitUntil: 'networkidle0',
      });

      // Check if page exists
      const pageTitle = await page.title();
      if (pageTitle.includes('Error') || pageTitle.includes('Not Found')) {
        throw new NotFoundException(
          `No product labeling found for setId: ${setId}`,
        );
      }

      // Extract NDC codes
      const ndcCodes = await this.extractNdcCodes(page);

      // Extract indications
      const indications = await this.extractIndications(page);

      // Extract last update date
      const lastUpdateDate = await this.extractLastUpdateDate(page);

      return {
        ndcCodes,
        indications,
        lastUpdateDate,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch DailyMed data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      await browser.close();
    }
  }

  private async extractNdcCodes(page: puppeteer.Page): Promise<string[]> {
    try {
      // Find the NDC codes section
      const ndcCodes = await page.evaluate(() => {
        const ndcSection = Array.from(document.querySelectorAll('div')).find(
          (div) => div.textContent?.includes('NDC Code(s)'),
        );

        if (!ndcSection) return [];

        // Get the text content after "NDC Code(s)"
        const text = ndcSection.textContent || '';

        // Find all NDC codes in the format XXXX-XXXX-XX
        const matches = text.match(/\d{4}-\d{4}-\d{2}/g);

        if (!matches) return [];

        // Return unique NDC codes
        return [...new Set(matches)];
      });

      return ndcCodes;
    } catch (error) {
      console.error('Error extracting NDC codes:', error);
      return [];
    }
  }

  private async extractIndications(page: puppeteer.Page): Promise<string> {
    try {
      // Find and click the "1 INDICATIONS AND USAGE" section
      const indications = await page.evaluate(() => {
        // Get all text content from the page
        const text = document.body.textContent || '';

        // Find the second occurrence of "1 INDICATIONS AND USAGE"
        const firstIndex = text.indexOf('1 INDICATIONS AND USAGE');
        if (firstIndex === -1) return '';

        const secondIndex = text.indexOf(
          '1 INDICATIONS AND USAGE',
          firstIndex + 1,
        );
        if (secondIndex === -1) return '';

        // Get the content between the second occurrence and the next section
        const content = text.slice(secondIndex);
        const nextSectionIndex = content.indexOf('DOSAGE AND ADMINISTRATION');
        const indicationsContent =
          nextSectionIndex === -1
            ? content
            : content.slice(0, nextSectionIndex);

        // Clean up the text while preserving the structure
        return indicationsContent
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .split('\n')
          .map((line) => {
            // Preserve numbered sections (e.g., "1.1", "1.2")
            if (line.match(/^\d+\.\d+\s/)) {
              return line.trim();
            }
            // Preserve section numbers (e.g., "1")
            if (line.match(/^\d+\s/)) {
              return line.trim();
            }
            // Preserve "Limitations of Use" sections
            if (line.trim().toLowerCase() === 'limitations of use') {
              return line.trim();
            }
            // For other lines, trim but preserve indentation
            return line.trim();
          })
          .filter((line) => line.length > 0)
          .join('\n')
          .trim();
      });

      // If we didn't get the full content, try to expand the section
      if (!indications.includes('1.1')) {
        // Find and click the expand button using a more reliable selector
        const expandButton = await page.$('button[aria-label="Expand"]');
        if (expandButton) {
          await expandButton.click();
          // Wait for content to load
          await new Promise((resolve) => setTimeout(resolve, 2000));
          // Try to get the content again
          return this.extractIndications(page);
        }
      }

      return indications;
    } catch (error) {
      console.error('Error extracting indications:', error);
      return '';
    }
  }

  private async extractLastUpdateDate(page: puppeteer.Page): Promise<string> {
    try {
      const lastUpdateDate = await page.evaluate(() => {
        // Find the text containing the update date
        const text = document.body.textContent || '';
        const match = text.match(
          /Updated\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/,
        );

        if (!match) return '';

        // Convert month name to number
        const monthMap: { [key: string]: string } = {
          January: '01',
          February: '02',
          March: '03',
          April: '04',
          May: '05',
          June: '06',
          July: '07',
          August: '08',
          September: '09',
          October: '10',
          November: '11',
          December: '12',
        };

        const month = monthMap[match[1]];
        const day = match[2].padStart(2, '0');
        const year = match[3];

        return `${year}${month}${day}`;
      });

      return lastUpdateDate;
    } catch (error) {
      console.error('Error extracting last update date:', error);
      return '';
    }
  }
}
