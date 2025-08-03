/// <reference types="cypress" />

describe('Data Save/Load Flow', () => {
  beforeEach(() => {
    // Mock encrypt/decrypt API endpoints
    cy.intercept('POST', '/api/encrypt', {
      statusCode: 200,
      body: { success: true, message: 'Data encrypted successfully' }
    }).as('encrypt');

    cy.intercept('POST', '/api/decrypt', {
      statusCode: 200,
      body: { success: true, message: 'Data decrypted successfully' }
    }).as('decrypt');

    // Visit home page and wait for app to be ready
    cy.visit('/');
    cy.get('[data-testid="app-ready"]').should('exist');
  });

  describe('Data Management Modal', () => {
    it('should display data management modal when Data button is clicked', () => {
      // Click the Data button in the header
      cy.contains('button', 'Data').click();
      
      // Modal should appear with data management content
      cy.contains('Data Management').should('be.visible');
      cy.contains('Save your watch-list and progress').should('be.visible');
      
      // Check action buttons are present
      cy.contains('button', 'Download Data').should('be.visible').and('not.be.disabled');
      cy.contains('button', 'Upload Data').should('be.visible').and('not.be.disabled');
      
      // Check current state display
      cy.contains('stocks tracked').should('be.visible');
    });

    it('should save data successfully when user has no data', () => {
      // Open the data management modal
      cy.contains('button', 'Data').click();
      
      // Try to save with empty state
      cy.contains('button', 'Download Data').click();
      
      // Wait for API call 
      cy.wait('@encrypt');
      
      // The save operation should trigger a download (browser handles this)
      // We can verify the API was called successfully by checking the intercepted request
      cy.get('@encrypt').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body.success).to.be.true;
      });
    });

    it('should show file upload button functionality', () => {
      // Open the data management modal
      cy.contains('button', 'Data').click();
      
      // Click upload button (should trigger file input)
      cy.contains('button', 'Upload Data').click();
      
      // File input should exist and be configured correctly
      cy.get('[data-testid="data-manager-file-input"]')
        .should('exist')
        .should('have.attr', 'accept', '.gt,.json')
        .should('have.attr', 'type', 'file');
    });

    it('should close modal when clicking outside or escape', () => {
      // Open the data management modal
      cy.contains('button', 'Data').click();
      
      // Modal should be visible
      cy.contains('Data Management').should('be.visible');
      
      // Press escape key to close modal
      cy.get('body').type('{esc}');
      
      // Modal should be closed
      cy.contains('Data Management').should('not.exist');
    });
  });

  describe('Modal Accessibility', () => {
    it('should handle keyboard navigation properly', () => {
      // Open modal
      cy.contains('button', 'Data').click();
      
      // Modal should be accessible
      cy.contains('Data Management').should('be.visible');
      
      // Both buttons should be visible and clickable
      cy.get('[data-testid="data-manager-save"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="data-manager-load"]').should('be.visible').and('not.be.disabled');
      
      // Test that buttons can be focused
      cy.get('[data-testid="data-manager-save"]').focus().should('be.focused');
    });

    it('should have proper ARIA attributes', () => {
      // Check that the trigger button has proper attributes
      cy.contains('button', 'Data')
        .should('have.attr', 'aria-label')
        .and('contain', 'Save or load your investment data');
    });
  });
});