import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Support file
    supportFile: 'cypress/support/e2e.ts',
    
    // Spec pattern for test files
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Fixtures folder
    fixturesFolder: 'cypress/fixtures',
    
    // Screenshots and videos
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
      
      // Task for generating test data or custom commands
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
      })
      
      return config
    },
    
    env: {
      // Environment variables for tests
      NEXT_PUBLIC_ALPHA_VANTAGE_KEY: 'demo',
      ENCRYPTION_KEY: 'test_encryption_key_32_characters_long',
      NEXT_PUBLIC_PARENT_AUTH_HASH: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
    }
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
})