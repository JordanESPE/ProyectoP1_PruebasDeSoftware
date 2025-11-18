const { exec } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Test Runner Module
 * Handles test execution with custom failure configurations
 * This module is excluded from coverage as it manipulates test files
 */

const testFiles = {
  'doctors-create': {
    file: path.join(__dirname, '../test/doctores.test.js'),
    find: 'expect(response.status).toBe(201);',
    replace: 'expect(response.status).toBe(500); // MODIFIED TO FAIL'
  },
  'doctors-update': {
    file: path.join(__dirname, '../test/doctores.test.js'),
    find: 'expect(response.status).toBe(200);\n    expect(response.body.name).toBe(\'Dr. Juan Actualizado\');',
    replace: 'expect(response.status).toBe(404); // MODIFIED TO FAIL\n    expect(response.body.name).toBe(\'Dr. Juan Actualizado\');'
  },
  'doctors-delete': {
    file: path.join(__dirname, '../test/doctores.test.js'),
    find: 'const deleteResponse = await request(app).delete(`/api/doctores/${doctorId}`);\n    expect(deleteResponse.status).toBe(200);',
    replace: 'const deleteResponse = await request(app).delete(`/api/doctores/${doctorId}`);\n    expect(deleteResponse.status).toBe(404); // MODIFIED TO FAIL'
  },
  'patients-create': {
    file: path.join(__dirname, '../test/pacientes.test.js'),
    find: 'expect(response.status).toBe(201);',
    replace: 'expect(response.status).toBe(500); // MODIFIED TO FAIL'
  },
  'medicines-create': {
    file: path.join(__dirname, '../test/medicamentos.test.js'),
    find: 'expect(response.status).toBe(201);',
    replace: 'expect(response.status).toBe(500); // MODIFIED TO FAIL'
  },
  'specialties-duplicate': {
    file: path.join(__dirname, '../test/especialidades.test.js'),
    find: 'expect(response2.status).toBe(409);',
    replace: 'expect(response2.status).toBe(201); // MODIFIED TO FAIL'
  }
};

/**
 * Modifies test files according to the failTests configuration
 * @param {Array} failTests - Array of test keys to modify
 * @returns {Array} Array of objects containing file path and original content
 */
function modifyTestFiles(failTests) {
  const modifiedFiles = [];

  if (failTests && Array.isArray(failTests) && failTests.length > 0) {
    failTests.forEach(testKey => {
      const testConfig = testFiles[testKey];
      if (testConfig) {
        try {
          const originalContent = fs.readFileSync(testConfig.file, 'utf8');
          const modifiedContent = originalContent.replace(testConfig.find, testConfig.replace);
          
          if (modifiedContent !== originalContent) {
            fs.writeFileSync(testConfig.file, modifiedContent);
            modifiedFiles.push({
              file: testConfig.file,
              original: originalContent
            });
          }
        } catch (fileError) {
          console.error(`Error modifying ${testConfig.file}:`, fileError);
        }
      }
    });
  }

  return modifiedFiles;
}

/**
 * Restores modified test files to their original state
 * @param {Array} modifiedFiles - Array of objects containing file path and original content
 */
function restoreTestFiles(modifiedFiles) {
  modifiedFiles.forEach(({ file, original }) => {
    try {
      fs.writeFileSync(file, original);
    } catch (restoreError) {
      console.error(`Error restoring ${file}:`, restoreError);
    }
  });
}

/**
 * Parses test output to extract test results
 * @param {String} output - Test output from npm test
 * @returns {Object} Parsed test results
 */
function parseTestResults(output) {
  const passedMatch = output.match(/(\d+)\s+passed/);
  const failedMatch = output.match(/(\d+)\s+failed/);
  const suitesPassedMatch = output.match(/Test Suites:.*?(\d+)\s+passed/);
  
  const passed = passedMatch ? Number.parseInt(passedMatch[1]) : 0;
  const failed = failedMatch ? Number.parseInt(failedMatch[1]) : 0;
  const total = passed + failed;
  const suites = suitesPassedMatch ? Number.parseInt(suitesPassedMatch[1]) : 0;

  return {
    passed,
    failed,
    total: total > 0 ? total : 36,
    suites
  };
}

/**
 * Saves test log to file
 * @param {Object} logData - Test log data to save
 */
function saveTestLog(logData) {
  try {
    const logFile = path.join(__dirname, '../test-logs.json');
    let logs = [];
    
    if (fs.existsSync(logFile)) {
      const existingData = fs.readFileSync(logFile, 'utf8');
      logs = JSON.parse(existingData);
    }
    
    logs.unshift({
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('es-ES'),
      ...logData
    });
    
    // Keep only last 100 entries
    if (logs.length > 100) {
      logs = logs.slice(0, 100);
    }
    
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  } catch (logError) {
    console.error('Error saving test log:', logError);
  }
}

/**
 * Runs tests with custom failure configuration
 * @param {Array} failTests - Array of test keys to fail
 * @param {Function} callback - Callback function with (error, result)
 */
function runTests(failTests, callback) {
  const modifiedFiles = [];
  
  try {
    // Modify selected tests
    const modified = modifyTestFiles(failTests);
    modifiedFiles.push(...modified);
    
    // Run tests
    exec('npm test', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      // Always restore files
      restoreTestFiles(modifiedFiles);
      
      // Parse test results
      const output = stdout + stderr;
      const results = parseTestResults(output);
      
      const result = {
        success: true,
        testsPassed: results.failed === 0,
        totalTests: results.total,
        passed: results.passed,
        failed: results.failed,
        suites: results.suites,
        output: output || 'No output received',
        error: null
      };
      
      // Save log
      saveTestLog({
        passed: results.passed,
        failed: results.failed,
        total: results.total,
        failedTests: failTests || [],
        output: output
      });
      
      callback(null, result);
    });
  } catch (error) {
    // Restore files in case of error
    restoreTestFiles(modifiedFiles);
    callback(error, null);
  }
}

/**
 * Gets test logs from file
 * @returns {Array} Array of test logs
 */
function getTestLogs() {
  try {
    const logFile = path.join(__dirname, '../test-logs.json');
    
    if (fs.existsSync(logFile)) {
      const logData = fs.readFileSync(logFile, 'utf8');
      return JSON.parse(logData);
    }
    
    return [];
  } catch (error) {
    throw new Error(`Error reading test logs: ${error.message}`);
  }
}

module.exports = {
  runTests,
  getTestLogs
};
