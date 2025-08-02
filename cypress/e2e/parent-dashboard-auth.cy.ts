/// <reference types="cypress" />

describe('Parent Dashboard Authentication Flow', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/');
    cy.get('[data-testid="app-ready"]').should('exist');
  });

  it('should navigate to parent dashboard from home page', () => {
    // Navigate to parent dashboard from home page link
    cy.get('a[href="/parent"]')
      .should('be.visible')
      .and('contain', 'Parent Dashboard')
      .click();
    
    // Should be on parent page
    cy.url().should('include', '/parent');
    cy.get('h1').should('contain', 'Parent Dashboard');
  });

  it('should show login form when not authenticated', () => {
    cy.visit('/parent');
    
    // Should show login form
    cy.get('[data-testid="parent-auth-form"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Access Dashboard');
    
    // Should show description text
    cy.contains('Enter the parent dashboard password').should('be.visible');
  });

  it('should reject invalid password', () => {
    cy.visit('/parent');
    
    // Enter wrong password
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.get('[role="alert"]').should('be.visible').and('contain', 'Invalid password');
    
    // Should remain on login form
    cy.get('[data-testid="parent-auth-form"]').should('be.visible');
  });

  it('should successfully authenticate with correct password', () => {
    cy.visit('/parent');
    
    // Enter correct password
    cy.get('input[type="password"]').type('admin');
    cy.get('button[type="submit"]').click();
    
    // Should access dashboard
    cy.get('[data-testid="parent-dashboard"]').should('be.visible');
    cy.get('h2').should('contain', 'Teen\'s Learning Activity');
    
    // Should show activity summary
    cy.get('[data-testid="activity-summary"]').should('be.visible');
  });

  it('should show teen activity data in dashboard', () => {
    // First add some test data by completing a lesson
    cy.visit('/lessons/01-understanding-stocks-index-funds');
    cy.get('[data-testid="lesson-content"]').should('be.visible');
    cy.scrollTo('bottom');
    cy.wait(2000); // Allow time for completion tracking
    
    // Now check parent dashboard
    cy.accessParentDashboard('admin');
    
    // Should show lessons completed
    cy.get('[data-testid="lessons-completed"]').should('be.visible');
    cy.get('[data-testid="lessons-completed"]').should('contain', '1');
    
    // Should show conversation starters
    cy.get('[data-testid="conversation-starters"]').should('be.visible');
    cy.contains('What did you learn about').should('be.visible');
  });

  it('should allow logout from dashboard', () => {
    cy.visit('/parent');
    cy.get('input[type="password"]').type('admin');
    cy.get('button[type="submit"]').click();
    
    // Should be in dashboard
    cy.get('[data-testid="parent-dashboard"]').should('be.visible');
    
    // Click logout
    cy.get('button').contains('Logout').click();
    
    // Should return to login form
    cy.get('[data-testid="parent-auth-form"]').should('be.visible');
    cy.get('input[type="password"]').should('have.value', '');
  });

  it('should maintain session during navigation', () => {
    cy.visit('/parent');
    cy.get('input[type="password"]').type('admin');
    cy.get('button[type="submit"]').click();
    
    // Navigate away and back
    cy.visit('/');
    cy.visit('/parent');
    
    // Should still be authenticated (session maintained)
    cy.get('[data-testid="parent-dashboard"]').should('be.visible');
  });

  it('should handle keyboard navigation', () => {
    cy.visit('/parent');
    
    // Focus password field directly and use keyboard
    cy.get('input[type="password"]').focus();
    cy.focused().should('have.attr', 'type', 'password');
    
    // Type password and submit with Enter
    cy.focused().type('admin{enter}');
    
    // Should authenticate
    cy.get('[data-testid="parent-dashboard"]').should('be.visible');
  });
});