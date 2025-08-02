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
  cy.get('[data-testid="ticker-search"]').type(symbol);
  cy.get('[data-testid="ticker-option"]').contains(symbol).click();
  cy.get('[data-testid="watch-list"]').should('contain', symbol);
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
  cy.get('[data-testid="parent-password"]').type(password);
  cy.get('[data-testid="parent-login"]').click();
  cy.get('[data-testid="parent-dashboard"]').should('be.visible');
});

// Custom command to save user data
Cypress.Commands.add('saveUserData', () => {
  cy.get('[data-testid="data-manager-save"]').click();
  cy.get('[data-testid="save-success"]').should('be.visible');
});

// Custom command to load user data
Cypress.Commands.add('loadUserData', (filename: string) => {
  cy.get('[data-testid="data-manager-load"]').selectFile(`cypress/fixtures/${filename}`);
  cy.get('[data-testid="load-success"]').should('be.visible');
});

// Custom command to wait for stock data
Cypress.Commands.add('waitForStockData', (symbol: string) => {
  cy.get(`[data-testid="stock-${symbol}"]`).should('be.visible');
  cy.get(`[data-testid="stock-${symbol}-price"]`).should('not.be.empty');
});

export {};