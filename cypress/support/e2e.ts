// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from Cypress command log for cleaner output
const app = window.top;
if (!app?.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app?.document.createElement('style');
  if (style) {
    style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');
    app?.document.head.appendChild(style);
  }
}

// Global before hook for common setup
beforeEach(() => {
  // Clear local storage and session storage before each test
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Wait for the app to be ready
  cy.visit('/');
  cy.get('[data-testid="app-ready"]', { timeout: 10000 }).should('exist');
});