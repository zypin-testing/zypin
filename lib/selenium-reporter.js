import builder from 'junit-report-builder';
import fs from 'fs-extra';
import path from 'path';

/**
 * Reporter for Selenium tests
 * Generates JUnit XML and JSON reports
 */
export class SeleniumReporter {
  constructor(config) {
    this.config = config;
    this.results = [];
    this.startTime = null;
    this.endTime = null;
    this.suite = null;
  }

  /**
   * Initialize the reporter
   */
  init(suiteName = 'Selenium Test Suite') {
    this.startTime = Date.now();
    this.suite = builder.testSuite().name(suiteName);
  }

  /**
   * Record a test start
   */
  startTest(testName) {
    return {
      name: testName,
      startTime: Date.now(),
      status: 'running'
    };
  }

  /**
   * Record a test pass
   */
  passTest(testInfo, duration) {
    const result = {
      name: testInfo.name,
      status: 'passed',
      duration: duration || (Date.now() - testInfo.startTime),
      startTime: testInfo.startTime,
      endTime: Date.now()
    };
    
    this.results.push(result);
    
    // Add to JUnit suite
    this.suite.testCase()
      .className(this.config.suiteName || 'SeleniumTests')
      .name(testInfo.name)
      .time((result.duration / 1000).toFixed(3));
    
    return result;
  }

  /**
   * Record a test failure
   */
  failTest(testInfo, error, screenshot = null) {
    const result = {
      name: testInfo.name,
      status: 'failed',
      duration: Date.now() - testInfo.startTime,
      startTime: testInfo.startTime,
      endTime: Date.now(),
      error: {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      }
    };
    
    if (screenshot) {
      result.screenshot = screenshot;
    }
    
    this.results.push(result);
    
    // Add to JUnit suite
    const testCase = this.suite.testCase()
      .className(this.config.suiteName || 'SeleniumTests')
      .name(testInfo.name)
      .time((result.duration / 1000).toFixed(3))
      .failure(error.message);
    
    if (error.stack) {
      testCase.stacktrace(error.stack);
    }
    
    return result;
  }

  /**
   * Generate all reports
   */
  async generateReports() {
    this.endTime = Date.now();
    
    const reportsDir = this.config.reportsDir || 'reports';
    await fs.ensureDir(reportsDir);
    
    // Generate JUnit XML
    await this.generateJUnitXML(reportsDir);
    
    // Generate JSON
    await this.generateJSON(reportsDir);
    
    console.log(`\nReports generated in: ${reportsDir}/`);
    console.log(`  - selenium-junit.xml`);
    console.log(`  - selenium-report.json`);
  }

  /**
   * Generate JUnit XML report
   */
  async generateJUnitXML(reportsDir) {
    const xmlPath = path.join(reportsDir, 'selenium-junit.xml');
    builder.writeTo(xmlPath);
  }

  /**
   * Generate JSON report
   */
  async generateJSON(reportsDir) {
    const jsonPath = path.join(reportsDir, 'selenium-report.json');
    
    const summary = this.getSummary();
    
    const report = {
      summary,
      tests: this.results,
      config: {
        browser: this.config.browser,
        headless: this.config.headless,
        suiteName: this.config.suiteName || 'Selenium Test Suite'
      },
      timestamp: new Date().toISOString()
    };
    
    await fs.writeJSON(jsonPath, report, { spaces: 2 });
  }

  /**
   * Get test summary statistics
   */
  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const duration = this.endTime - this.startTime;
    
    return {
      total,
      passed,
      failed,
      duration,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(this.endTime).toISOString()
    };
  }

  /**
   * Print summary to console
   */
  printSummary() {
    const summary = this.getSummary();
    
    console.log('\n' + '='.repeat(50));
    console.log('Test Summary');
    console.log('='.repeat(50));
    console.log(`Total:    ${summary.total}`);
    console.log(`Passed:   ${summary.passed}`);
    console.log(`Failed:   ${summary.failed}`);
    console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(50));
  }
}

