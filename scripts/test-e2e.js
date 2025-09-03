#!/usr/bin/env node

/**
 * Smart E2E test runner that handles server startup and port conflicts
 */

const { execSync, spawn } = require('child_process')
const net = require('net')

const DEFAULT_PORT = 3000
const FALLBACK_PORTS = [3001, 3002, 3003]

// Function to check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(port, () => {
      server.once('close', () => resolve(true))
      server.close()
    })
    server.on('error', () => resolve(false))
  })
}

// Function to find an available port
async function findAvailablePort() {
  const portsToCheck = [DEFAULT_PORT, ...FALLBACK_PORTS]
  
  for (const port of portsToCheck) {
    if (await isPortAvailable(port)) {
      return port
    }
  }
  throw new Error('No available ports found')
}

// Function to check if server is responding
function checkServerHealth(port, maxRetries = 10) {
  return new Promise((resolve, reject) => {
    let retries = 0
    
    const check = () => {
      const req = require('http').get(`http://localhost:${port}`, (res) => {
        resolve(port)
      })
      
      req.on('error', () => {
        retries++
        if (retries >= maxRetries) {
          reject(new Error(`Server not responding on port ${port} after ${maxRetries} attempts`))
        } else {
          setTimeout(check, 1000)
        }
      })
    }
    
    check()
  })
}

async function main() {
  console.log('🚀 Smart E2E Test Runner')
  
  try {
    // Check if server is already running
    let serverPort = null
    const portsToCheck = [DEFAULT_PORT, ...FALLBACK_PORTS]
    
    for (const port of portsToCheck) {
      try {
        await checkServerHealth(port, 1)
        console.log(`✅ Server already running on port ${port}`)
        serverPort = port
        break
      } catch (e) {
        // Port not responding, continue checking
      }
    }
    
    // If no server is running, start one
    if (!serverPort) {
      console.log('🔧 No server detected, starting development server...')
      const availablePort = await findAvailablePort()
      
      const serverProcess = spawn('npm', ['run', 'dev'], {
        env: { ...process.env, PORT: availablePort.toString() },
        stdio: 'pipe'
      })
      
      // Wait for server to be ready
      console.log(`⏳ Starting server on port ${availablePort}...`)
      serverPort = await checkServerHealth(availablePort, 30)
      console.log(`✅ Server ready on port ${serverPort}`)
      
      // Ensure server is killed when script exits
      process.on('exit', () => serverProcess.kill())
      process.on('SIGINT', () => {
        serverProcess.kill()
        process.exit()
      })
    }
    
    // Set environment variables for Playwright
    process.env.NEXT_PORT = serverPort.toString()
    process.env.BASE_URL = `http://localhost:${serverPort}`
    
    // Get test arguments
    const testArgs = process.argv.slice(2)
    const defaultArgs = ['test', '--reporter=list']
    const finalArgs = testArgs.length > 0 ? ['test', ...testArgs] : defaultArgs
    
    console.log(`🎭 Running Playwright tests against http://localhost:${serverPort}`)
    console.log(`📋 Command: npx playwright ${finalArgs.join(' ')}`)
    
    // Run Playwright tests
    execSync(`npx playwright ${finalArgs.join(' ')}`, {
      stdio: 'inherit',
      env: { ...process.env }
    })
    
    console.log('✅ Tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Error running tests:', error.message)
    process.exit(1)
  }
}

// Handle command line usage
if (require.main === module) {
  main()
}

module.exports = { findAvailablePort, checkServerHealth }
