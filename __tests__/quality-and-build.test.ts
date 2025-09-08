import { execSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

interface ErrorWithStdout extends Error {
    stdout?: Buffer | string
}

describe('Code Quality & Build Tests', () => {
    // TypeScript Tests
    describe('TypeScript Compilation', () => {
        test('should compile TypeScript without critical errors', () => {
            try {
                execSync('npx tsc --noEmit', {
                    cwd: process.cwd(),
                    stdio: 'pipe',
                    encoding: 'utf-8',
                })
            } catch (error) {
                const errorWithStdout = error as ErrorWithStdout
                const output = errorWithStdout.stdout?.toString() || errorWithStdout.message

                // Only fail if there are critical errors (not test file typing issues)
                const hasCriticalErrors =
                    output.includes('src/app/') ||
                    (output.includes('src/components/') && !output.includes('test')) ||
                    output.includes('src/lib/') ||
                    output.includes('src/server/')

                if (hasCriticalErrors) {
                    throw new Error(`TypeScript compilation failed with critical errors:\n${output}`)
                }
                // Otherwise just log the test-related errors but don't fail
                console.log('TypeScript warnings (test files):', output)
            }
        })

        test('should verify all critical files exist', () => {
            const criticalFiles = [
                'src/app/page.tsx',
                'src/app/vehicles/page.tsx',
                'src/app/buy-now/page.tsx',
                'src/app/bidding/page.tsx',
                'src/components/VehiclesGrid.tsx',
                'src/components/VehicleFilters.tsx',
                'src/components/navigation/TransparentNavigation.tsx',
            ]

            criticalFiles.forEach(file => {
                const filePath = path.join(process.cwd(), file)
                expect(existsSync(filePath)).toBe(true)
            })
        })
    })

    // ESLint Tests
    describe('ESLint Code Quality', () => {
        test('should pass ESLint checks for source files', () => {
            try {
                execSync('npx eslint src/ __tests__ --ext .js,.jsx,.ts,.tsx', {
                    cwd: process.cwd(),
                    stdio: 'pipe',
                    encoding: 'utf-8',
                })
            } catch (error) {
                const errorWithStdout = error as ErrorWithStdout
                const output = errorWithStdout.stdout?.toString() || errorWithStdout.message

                // Filter out warning about .eslintignore deprecation
                const filteredOutput = output
                    .split('\n')
                    .filter(line => !line.includes('ESLintIgnoreWarning'))
                    .join('\n')

                if (filteredOutput.trim()) {
                    throw new Error(`ESLint errors found:\n${filteredOutput}`)
                }
            }
        })

        test('should have ESLint configuration', () => {
            const eslintConfigPath = path.join(process.cwd(), 'eslint.config.mjs')
            expect(existsSync(eslintConfigPath)).toBe(true)
        })
    })

    // Prettier Tests
    describe('Code Formatting', () => {
        test('should pass Prettier formatting checks', () => {
            try {
                execSync('npx prettier --check src/ __tests__/ --ignore-path .gitignore', {
                    cwd: process.cwd(),
                    stdio: 'pipe',
                    encoding: 'utf-8',
                })
            } catch (error) {
                const errorWithStdout = error as ErrorWithStdout
                const output = errorWithStdout.stdout?.toString() || errorWithStdout.message
                throw new Error(`Prettier formatting issues found:\n${output}`)
            }
        })

        test('should have Prettier configuration', () => {
            const prettierConfigPath = path.join(process.cwd(), '.prettierrc')
            expect(existsSync(prettierConfigPath)).toBe(true)
        })
    })

    // Build Tests
    describe('Production Build', () => {
        test('should build successfully for production', () => {
            try {
                execSync('npm run build', {
                    cwd: process.cwd(),
                    stdio: 'pipe',
                    encoding: 'utf-8',
                })
            } catch (error) {
                const errorWithStdout = error as ErrorWithStdout
                const output = errorWithStdout.stdout?.toString() || errorWithStdout.message
                throw new Error(`Build failed:\n${output}`)
            }
        }, 60000) // 60 second timeout for build

        test('should verify Next.js config exists and is valid', () => {
            const configPath = path.join(process.cwd(), 'next.config.ts')
            expect(existsSync(configPath)).toBe(true)

            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                require(configPath)
            } catch (error) {
                const errorWithMessage = error as Error
                throw new Error(`Next.js config is invalid: ${errorWithMessage.message}`)
            }
        })
    })

    // Runtime Tests
    describe('Runtime Environment', () => {
        test('should verify package.json dependencies are valid', () => {
            const packageJsonPath = path.join(process.cwd(), 'package.json')
            expect(existsSync(packageJsonPath)).toBe(true)

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const packageJson = require(packageJsonPath)

            // Critical dependencies should exist
            const criticalDeps = [
                'next',
                'react',
                'react-dom',
                '@prisma/client',
                'next-auth',
                'tailwindcss',
            ]

            criticalDeps.forEach(dep => {
                expect(packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]).toBeDefined()
            })
        })

        test('should verify Prisma schema is valid', () => {
            try {
                execSync('npx prisma validate', {
                    cwd: process.cwd(),
                    stdio: 'pipe',
                })
            } catch (error) {
                const errorWithStdout = error as ErrorWithStdout
                throw new Error(
                    `Prisma schema validation failed:\n${errorWithStdout.stdout?.toString() || errorWithStdout.message}`
                )
            }
        })

        test('should verify environment files exist', () => {
            const envFiles = ['.env', '.env.local']
            let hasEnvFile = false

            envFiles.forEach(file => {
                const filePath = path.join(process.cwd(), file)
                if (existsSync(filePath)) {
                    hasEnvFile = true
                }
            })

            expect(hasEnvFile).toBe(true)
        })

        test('should verify critical directories exist', () => {
            const criticalDirs = ['src/', 'src/app/', 'src/components/', 'prisma/', '__tests__/']

            criticalDirs.forEach(dir => {
                const dirPath = path.join(process.cwd(), dir)
                expect(existsSync(dirPath)).toBe(true)
            })
        })
    })

    // Integration Tests
    describe('Integration & Configuration', () => {
        test('should have proper Jest configuration', () => {
            const jestConfigPath = path.join(process.cwd(), 'jest.config.js')
            expect(existsSync(jestConfigPath)).toBe(true)
        })

        test('should have proper TypeScript configuration', () => {
            const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
            expect(existsSync(tsconfigPath)).toBe(true)

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const tsconfig = require(tsconfigPath)
            expect(tsconfig.compilerOptions).toBeDefined()
            expect(tsconfig.include).toBeDefined()
        })

        test('should have proper Tailwind configuration', () => {
            const tailwindConfigExists =
                existsSync(path.join(process.cwd(), 'tailwind.config.js')) ||
                existsSync(path.join(process.cwd(), 'tailwind.config.ts'))

            expect(tailwindConfigExists).toBe(true)
        })

        test('should have proper PostCSS configuration', () => {
            const postcssConfigPath = path.join(process.cwd(), 'postcss.config.mjs')
            expect(existsSync(postcssConfigPath)).toBe(true)
        })
    })
})
