/// <reference types="cypress" />

describe('Chart Interactions', () => {
  beforeEach(() => {
    // Mock Financial Modeling Prep API responses
    cy.intercept('GET', '/api/stock/AAPL', { fixture: 'fmp-aapl.json' }).as('getAAPL');
    cy.intercept('GET', '/api/stock/GOOGL', { fixture: 'fmp-googl.json' }).as('getGOOGL');
    cy.intercept('GET', '/api/stock/TSLA', { fixture: 'fmp-tsla.json' }).as('getTSLA');
    
    // Visit home page and wait for app to be ready
    cy.visit('/');
    cy.get('[data-testid="app-ready"]').should('exist');
  });

  describe('Basic Functionality', () => {
    it('should display the homepage correctly', () => {
      // Check basic homepage elements
      cy.contains('Learn Investing Through Interactive Experience').should('be.visible');
      cy.contains('Watch List').should('be.visible');
      cy.get('[data-testid="watchlist"]').should('be.visible');
    });

    it('should allow adding stocks via search', () => {
      // Test the basic stock search functionality
      cy.get('input[placeholder="Search for stocks and ETFs to add..."]').type('AAPL');
      
      // The search should show suggestions
      cy.contains('AAPL').should('be.visible');
    });

    it('should display empty watchlist state', () => {
      // Check empty state
      cy.contains('Your watch list is empty').should('be.visible');
      cy.contains('Add some stock ticker symbols').should('be.visible');
    });
  });

  describe('Search Functionality', () => {
    it('should show search suggestions when typing', () => {
      // Type in search box
      cy.get('input[placeholder="Search for stocks and ETFs to add..."]').type('A');
      
      // Should show some suggestions
      cy.get('body').should('contain', 'AAPL');
    });

    it('should handle search input interactions', () => {
      // Test that search input is functional
      cy.get('input[placeholder="Search for stocks and ETFs to add..."]')
        .should('be.visible')
        .and('not.be.disabled')
        .type('TSLA')
        .should('have.value', 'TSLA');
    });
  });
});