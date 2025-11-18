const express = require('express');
const path = require('node:path');
const patientRoutes = require('./routes/pacientes.routes');
const medicamentosRoutes = require('./routes/medicamentos.routes');
const especialidadesRoutes = require('./routes/especialidades.routes');
const doctoresRoutes = require('./routes/doctores.routes');

const app = express(); // Creates an Express application instance

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware to parse JSON from request body
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Base routes for each model
app.use('/api/pacientes', patientRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/doctores', doctoresRoutes);

// Endpoint to run tests with custom failure configuration
app.post('/api/run-tests', (req, res) => {
  const { exec } = require('node:child_process');
  const fs = require('node:fs');
  const { failTests } = req.body;
  
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
  
  const modifiedFiles = [];
  
  try {
    // Modify selected tests
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
    
    // Run tests
    exec('npm test', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      // Restore all modified files
      modifiedFiles.forEach(({ file, original }) => {
        try {
          fs.writeFileSync(file, original);
        } catch (restoreError) {
          console.error(`Error restoring ${file}:`, restoreError);
        }
      });
      
      // Parse test results
      const output = stdout + stderr;
      const passedMatch = output.match(/(\d+)\s+passed/);
      const failedMatch = output.match(/(\d+)\s+failed/);
      const suitesPassedMatch = output.match(/Test Suites:.*?(\d+)\s+passed/);
      
      const passed = passedMatch ? Number.parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? Number.parseInt(failedMatch[1]) : 0;
      const total = passed + failed;
      const suites = suitesPassedMatch ? Number.parseInt(suitesPassedMatch[1]) : 0;
      
      const result = {
        success: true,
        testsPassed: failed === 0,
        totalTests: total > 0 ? total : 36,
        passed: passed,
        failed: failed,
        suites: suites,
        output: output || 'No output received',
        error: null
      };
      
      // Save log to file
      try {
        const logFile = path.join(__dirname, '../test-logs.json');
        let logs = [];
        
        if (fs.existsSync(logFile)) {
          const logData = fs.readFileSync(logFile, 'utf8');
          logs = JSON.parse(logData);
        }
        
        logs.unshift({
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleString('es-ES'),
          passed: passed,
          failed: failed,
          total: total,
          failedTests: failTests || [],
          output: output
        });
        
        // Keep only last 100 entries
        if (logs.length > 100) {
          logs = logs.slice(0, 100);
        }
        
        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
      } catch (logError) {
        console.error('Error saving test log:', logError);
      }
      
      res.json(result);
    });
  } catch (error) {
    // Restore files in case of error
    modifiedFiles.forEach(({ file, original }) => {
      try {
        fs.writeFileSync(file, original);
      } catch (restoreError) {
        console.error(`Error restoring ${file}:`, restoreError);
      }
    });
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint to get test logs
app.get('/api/test-logs', (req, res) => {
  const fs = require('node:fs');
  const logFile = path.join(__dirname, '../test-logs.json');
  
  try {
    if (fs.existsSync(logFile)) {
      const logData = fs.readFileSync(logFile, 'utf8');
      const logs = JSON.parse(logData);
      res.json({ success: true, logs: logs });
    } else {
      res.json({ success: true, logs: [] });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Handler for routes not found (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Export app to use it in tests or in a separate server file
module.exports = app;
