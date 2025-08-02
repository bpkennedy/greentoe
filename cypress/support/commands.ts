/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to add a stock to the watch list
       * @example cy.addStockToWatchList('AAPL')
       */
      addStockToWatchList(symbol: string): Chainable<void>
      
      /**
       * Custom command to complete a lesson
       * @example cy.completeLesson('01-understanding-stocks-index-funds')
       */
      completeLesson(lessonId: string): Chainable<void>
      
      /**
       * Custom command to access parent dashboard
       * @example cy.accessParentDashboard('admin')
       */
      accessParentDashboard(password?: string): Chainable<void>
      
      /**
       * Custom command to save user data
       * @example cy.saveUserData()
       */
      saveUserData(): Chainable<void>
      
      /**
       * Custom command to load user data from file
       * @example cy.loadUserData('test-data.gt')
       */
      loadUserData(filename: string): Chainable<void>
      
      /**
       * Custom command to wait for stock data to load
       * @example cy.waitForStockData('AAPL')
       */
      waitForStockData(symbol: string): Chainable<void>
    }
  }
}

// Custom command to add stock to watch list
Cypress.Commands.add('addStockToWatchList', (symbol: string) => {
  // Use placeholder text to find search input (more resilient)
  cy.get('input[placeholder*="stock"]').type(symbol);
  
  // Wait for and click on stock suggestion using visible text
  cy.contains(symbol).click();
  
  // Verify stock appears in watch list using visible text
  cy.contains('Watch List').parent().should('contain', symbol);
});

// Custom command to complete a lesson
Cypress.Commands.add('completeLesson', (lessonId: string) => {
  cy.visit(`/lessons/${lessonId}`);
  cy.get('[data-testid="lesson-content"]').should('be.visible');
  
  // Scroll to bottom to trigger completion
  cy.scrollTo('bottom');
  cy.wait(1000); // Wait for scroll tracking
  
  cy.get('[data-testid="lesson-completed"]').should('be.visible');
});

// Custom command to access parent dashboard
Cypress.Commands.add('accessParentDashboard', (password: string = 'admin') => {
  cy.visit('/parent');
  
  // Use label-based selection for form inputs (more resilient)
  cy.contains('label', 'Username').parent().find('input').type('admin');
  cy.contains('label', 'Password').parent().find('input').type(password);
  cy.contains('button', 'Sign In').click();
  
  // Check for dashboard content using visible text
  cy.contains('Monitor your teen\'s progress').should('be.visible');
});

// Custom command to save user data
Cypress.Commands.add('saveUserData', () => {
  // Use visible button text first, fallback to data-testid
  cy.contains('button', 'Download Data').click();
  cy.contains('Success!').should('be.visible');
});

// Custom command to load user data
Cypress.Commands.add('loadUserData', (filename: string) => {
  // Use visible button text, then select file using the hidden input
  cy.contains('button', 'Upload Data').click();
  cy.get('[data-testid="data-manager-file-input"]').selectFile(`cypress/fixtures/${filename}`, { force: true });
  cy.contains('Success!').should('be.visible');
});

// Custom command to wait for stock data
Cypress.Commands.add('waitForStockData', (symbol: string) => {
  // With mocked data, we can wait for specific API calls and then the price display
  cy.wait(`@get${symbol}`, { timeout: 10000 });
  
  // Wait for stock card to be visible
  cy.get(`[data-testid="stock-card-${symbol}"]`).should('be.visible');
  
  // Wait for price to load in the stock card
  cy.get(`[data-testid="stock-card-${symbol}"]`).within(() => {
    cy.contains('Loading...').should('not.exist');
    cy.contains('$').should('be.visible'); // Price should be displayed
  });
});

// Custom command for Tab key navigation
Cypress.Commands.add('tab', { prevSubject: 'element' }, (subject: any) => {
  return cy.wrap(subject).trigger('keydown', { key: 'Tab' });
});

// TypeScript declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      addStockToWatchList(symbol: string): Chainable<void>
      completeLesson(lessonId: string): Chainable<void>
      accessParentDashboard(password?: string): Chainable<void>
      saveUserData(): Chainable<void>
      loadUserData(fixtureFile: string): Chainable<void>
      waitForStockData(symbol: string): Chainable<void>
      tab(): Chainable<Element>
    }
  }
}

export {};