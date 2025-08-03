/// <reference types="cypress" />

describe('Parent Dashboard Authentication Flow', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/');
    cy.get('[data-testid="app-ready"]').should('exist');
  });

  it('should navigate to parent dashboard from home page', () => {
    // Navigate to parent dashboard from home page link using visible text
    cy.contains('a', 'Parent Dashboard')
      .should('be.visible')
      .click();
    
    // Should be on parent page with login form
    cy.url().should('include', '/parent');
    cy.contains('Parent Dashboard').should('be.visible');
    cy.contains('Enter the parent dashboard password').should('be.visible');
  });

  it('should show login form when not authenticated', () => {
    cy.visit('/parent');
    
    // Should show login form using visible text and labels
    cy.contains('Parent Dashboard').should('be.visible');
    cy.contains('Enter the parent dashboard password').should('be.visible');
    
    // Check form elements by their labels (more resilient than type selectors)
    cy.contains('label', 'Username').should('be.visible');
    cy.contains('label', 'Password').should('be.visible');
    cy.contains('button', 'Sign In').should('be.visible');
    
    // Should show demo credentials section
    cy.contains('Demo Credentials').should('be.visible');
  });

  it('should reject invalid password', () => {
    cy.visit('/parent');
    
    // Enter credentials using label-based selection (more resilient)
    cy.contains('label', 'Username').parent().find('input').type('admin');
    cy.contains('label', 'Password').parent().find('input').type('wrongpassword');
    cy.contains('button', 'Sign In').click();
    
    // Should show error message using ARIA role (better than searching for specific text)
    cy.get('[role="alert"]').should('be.visible').and('contain', 'Invalid credentials');
    
    // Should remain on login form by checking visible text
    cy.contains('Enter the parent dashboard password').should('be.visible');
  });

  it('should successfully authenticate with correct password', () => {
    cy.visit('/parent');
    
    // Enter correct credentials using labels
    cy.contains('label', 'Username').parent().find('input').type('admin');
    cy.contains('label', 'Password').parent().find('input').type('admin');
    cy.contains('button', 'Sign In').click();
    
    // Should access dashboard by checking visible content
    cy.contains('Monitor your teen\'s learning progress and activity').should('be.visible');
    cy.contains('button', 'Logout').should('be.visible');
    
    // Should show activity summary content using visible text (handle HTML entities)
    cy.contains('Teen\'s Learning Activity').should('be.visible');
    cy.contains('Lessons Completed').should('be.visible');
    cy.contains('Watch-List Items').should('be.visible');
  });

  it('should show teen activity data in dashboard', () => {
    // First add some test data by completing a lesson
    cy.visit('/lessons/01-understanding-stocks-index-funds');
    cy.contains('Understanding Stocks and Index Funds').should('be.visible');
    cy.scrollTo('bottom');
    cy.wait(2000); // Allow time for completion tracking
    
    // Now check parent dashboard
    cy.accessParentDashboard('admin');
    
    // Should show activity metrics using visible text
    cy.contains('Lessons Completed').should('be.visible');
    cy.contains('Time Invested').should('be.visible');
    cy.contains('Last Activity').should('be.visible');
    
    // Should show conversation starters section
    cy.contains('Conversation Starters').should('be.visible');
    cy.contains('Ask about their favorite company').should('be.visible');
  });

  it('should allow logout from dashboard', () => {
    cy.visit('/parent');
    
    // Login using labels
    cy.contains('label', 'Username').parent().find('input').type('admin');
    cy.contains('label', 'Password').parent().find('input').type('admin');
    cy.contains('button', 'Sign In').click();
    
    // Should be in dashboard
    cy.contains('Monitor your teen\'s learning progress and activity').should('be.visible');
    
    // Click logout using visible text
    cy.contains('button', 'Logout').click();
    
    // Should return to login form using visible content
    cy.contains('Enter the parent dashboard password').should('be.visible');
    cy.contains('label', 'Password').parent().find('input').should('have.value', '');
  });

  it('should require authentication after page refresh', () => {
    cy.visit('/parent');
    
    // Login using labels
    cy.contains('label', 'Username').parent().find('input').type('admin');
    cy.contains('label', 'Password').parent().find('input').type('admin');
    cy.contains('button', 'Sign In').click();
    
    // Verify dashboard is accessible
    cy.contains('Monitor your teen\'s learning progress and activity').should('be.visible');
    
    // Refresh page (which should require re-authentication)
    cy.reload();
    
    // Should be back to login form (no session persistence currently)
    cy.contains('Enter the parent dashboard password').should('be.visible');
  });

  it('should handle keyboard navigation', () => {
    cy.visit('/parent');
    
    // Use keyboard navigation to fill form
    cy.contains('label', 'Username').parent().find('input').focus().type('admin');
    cy.contains('label', 'Password').parent().find('input').focus().type('admin{enter}');
    
    // Should authenticate and show dashboard content
    cy.contains('Monitor your teen\'s learning progress and activity').should('be.visible');
  });
});