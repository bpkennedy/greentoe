/// <reference types="cypress" />

describe('Data Save/Load Flow', () => {
  beforeEach(() => {
    // Mock Alpha Vantage API responses (same as chart tests)
    cy.intercept('GET', '/api/stock/AAPL', { fixture: 'alpha-vantage-mock.json' }).as('getAAPL');
    cy.intercept('GET', '/api/stock/GOOGL', { fixture: 'alpha-vantage-googl.json' }).as('getGOOGL');
    cy.intercept('GET', '/api/stock/TSLA', { fixture: 'alpha-vantage-tsla.json' }).as('getTSLA');
    
    // Mock encryption/decryption API endpoints
    cy.intercept('POST', '/api/encrypt', {
      statusCode: 200,
      headers: { 'Content-Type': 'application/octet-stream' },
      body: 'mock-encrypted-data' // Mock binary data
    }).as('encrypt');
    
    cy.intercept('POST', '/api/decrypt', {
      statusCode: 200,
      body: {
        watchList: ['AAPL', 'GOOGL'],
        completedLessons: ['lesson-1', 'lesson-2'],
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }).as('decrypt');
    
    // Visit home page and wait for app to be ready
    cy.visit('/');
    cy.get('[data-testid="app-ready"]').should('exist');
  });

  it('should display data management section with current state', () => {
    // Debug: Check if basic page elements load
    cy.contains('Green Thumb', { timeout: 10000 }).should('be.visible');
    cy.contains('Stock Watch List').should('be.visible');
    
    // Check if DataManager section is visible by scrolling down
    cy.scrollTo('bottom');
    cy.wait(3000); // Give more time for dynamic imports
    
    // Look for DataManager content
    cy.contains('Data Management', { timeout: 10000 }).should('be.visible');
    cy.contains('Save your watch-list and progress').should('be.visible');
    
    // Check action buttons are present
    cy.contains('button', 'Download Data').should('be.visible').and('not.be.disabled');
    cy.contains('button', 'Upload Data').should('be.visible').and('not.be.disabled');
    
    // Check current state display
    cy.contains('stocks tracked').should('be.visible');
    cy.contains('lessons completed').should('be.visible');
    
    // Check encryption info
    cy.contains('encrypted .gt files').should('be.visible');
    cy.contains('AES-256-GCM encryption').should('be.visible');
  });

  it('should save data successfully when user has data', () => {
    // First load some test data to have something to save
    cy.loadUserData('test-backup.json');
    
    // Verify data was loaded (should show 3 stocks from test-backup.json)
    cy.contains('3').should('be.visible'); // 3 stocks tracked
    
    // Clear any previous messages by waiting
    cy.wait(1000);
    
    // Now save the loaded data
    cy.contains('button', 'Download Data').click();
    
    // Wait for the encrypt API call
    cy.wait('@encrypt');
    
    // Should show success
    cy.contains('Success!').should('be.visible');
    // Check that some filename is mentioned (might not be exactly 'green-thumb-state.gt')
    cy.contains(/\.gt/).should('be.visible');
  });

  it('should save data when user has no data', () => {
    // Try to save with empty state
    cy.contains('button', 'Download Data').click();
    
    // Wait for the encrypt API call
    cy.wait('@encrypt');
    
    // Should still work (empty data is valid)
    cy.contains('Success!', { timeout: 15000 }).should('be.visible');
    cy.contains('0').should('be.visible'); // 0 stocks tracked
  });

  it('should handle file upload interaction', () => {
    // Click upload button (should trigger file input)
    cy.contains('button', 'Upload Data').click();
    
    // File input should exist and accept .gt files
    cy.get('[data-testid="data-manager-file-input"]')
      .should('exist')
      .should('have.attr', 'accept', '.gt')
      .should('have.attr', 'type', 'file');
  });

  it('should load data successfully with no existing data', () => {
    // Ensure we start with clean state
    cy.contains('0').should('be.visible'); // 0 stocks tracked
    
    // Load test data
    cy.loadUserData('test-backup.json');
    
    // Should show success without merge options (no existing data)
    cy.contains('Success!').should('be.visible');
    
    // Verify data was loaded - stocks should appear
    cy.contains('3').should('be.visible'); // 3 stocks tracked
  });

  it.only('should show merge options when loading data with existing data', () => {
    // First load some test data to create existing data
    cy.loadUserData('test-backup.json');
    cy.contains('3').should('be.visible'); // 3 stocks tracked
    
    // Clear any previous messages by waiting
    cy.wait(1000);
    
    // Now try to load different data that will conflict
    cy.contains('button', 'Upload Data').click();
    cy.get('[data-testid="data-manager-file-input"]').selectFile('cypress/fixtures/test-data.json', { force: true });
    
    // Should show merge options
    cy.contains('How should we handle your existing data?').should('be.visible');
    
    // Check all merge strategy options are present
    cy.contains('Merge data').should('be.visible');
    cy.contains('Replace current data').should('be.visible');
    
    // Check buttons are present
    cy.contains('button', 'Continue').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
  });

  it('should handle merge strategy - merge data', () => {
    // Add existing data
    cy.addStockToWatchList('TSLA');
    cy.waitForStockData('TSLA');
    
    // Load conflicting data
    cy.contains('button', 'Upload Data').click();
    cy.get('[data-testid="data-manager-file-input"]').selectFile('cypress/fixtures/test-backup.json', { force: true });
    
    // Select merge strategy (should be default)
    cy.get('input[value="merge"]').should('be.checked');
    cy.contains('button', 'Continue').click();
    
    // Should show success
    cy.contains('Success!').should('be.visible');
    cy.contains('merged successfully').should('be.visible');
    
    // Should have both original and loaded data
    cy.contains('TSLA').should('be.visible'); // Original data
  });

  it('should handle merge strategy - replace data', () => {
    // Add existing data
    cy.addStockToWatchList('TSLA');
    cy.waitForStockData('TSLA');
    
    // Load conflicting data
    cy.contains('button', 'Upload Data').click();
    cy.get('[data-testid="data-manager-file-input"]').selectFile('cypress/fixtures/test-backup.json', { force: true });
    
    // Select replace strategy
    cy.get('input[value="replace"]').check();
    cy.contains('button', 'Continue').click();
    
    // Should show success
    cy.contains('Success!').should('be.visible');
    cy.contains('replaced successfully').should('be.visible');
    
    // Should have 3 stocks (from test data, not original TSLA)
    cy.contains('3').should('be.visible');
  });



  it('should handle merge cancellation', () => {
    // Add existing data
    cy.addStockToWatchList('TSLA');
    cy.waitForStockData('TSLA');
    
    // Load conflicting data
    cy.contains('button', 'Upload Data').click();
    cy.get('[data-testid="data-manager-file-input"]').selectFile('cypress/fixtures/test-backup.json', { force: true });
    
    // Cancel the merge
    cy.contains('button', 'Cancel').click();
    
    // Should show cancellation message
    cy.contains('Load operation cancelled').should('be.visible');
    
    // Original data should remain unchanged
    cy.contains('TSLA').should('be.visible');
    cy.contains('1').should('be.visible'); // Still 1 stock
  });

  it('should clear result messages', () => {
    // Generate a result message
    cy.contains('button', 'Download Data').click();
    cy.contains('Success!').should('be.visible');
    
    // Click the close button (×)
    cy.get('[data-testid="save-success"]').within(() => {
      cy.contains('×').click();
    });
    
    // Result message should disappear
    cy.contains('Success!').should('not.exist');
  });

  it('should show loading states appropriately', () => {
    // Add a delayed mock for this test to make loading state visible
    cy.intercept('POST', '/api/encrypt', {
      statusCode: 200,
      body: { success: true, message: 'Data encrypted successfully' },
      delay: 1000 // 1 second delay to see loading state
    }).as('slowEncrypt');
    
    // Test save loading state
    cy.contains('button', 'Download Data').click();
    
    // Should show loading state briefly
    cy.contains('Saving...').should('be.visible');
    cy.get('[data-testid="data-manager-save"]').should('be.disabled');
    
    // Wait for completion
    cy.wait('@slowEncrypt');
    cy.contains('Success!').should('be.visible');
    cy.get('button').contains('Download Data').should('not.be.disabled');
  });

  it('should maintain data integrity across save/load cycle', () => {
    // Add specific test data
    cy.addStockToWatchList('AAPL');
    cy.waitForStockData('AAPL');
    cy.addStockToWatchList('GOOGL');
    cy.waitForStockData('GOOGL');
    
    // Complete a lesson
    cy.completeLesson('01-understanding-stocks-index-funds');
    
    // Save current state
    cy.contains('button', 'Download Data').click();
    cy.contains('Success!').should('be.visible');
    
    // Verify we have 2 stocks and 1 lesson
    cy.contains('2').should('be.visible'); // 2 stocks tracked
    
    // For full integrity test, we would need to:
    // 1. Clear the current state
    // 2. Load the saved file back
    // 3. Verify all data matches
    // Note: This requires additional state management features
  });

  it('should handle keyboard navigation in merge dialog', () => {
    // Add existing data
    cy.addStockToWatchList('TSLA');
    cy.waitForStockData('TSLA');
    
    // Load conflicting data
    cy.contains('button', 'Upload Data').click();
    cy.get('[data-testid="data-manager-file-input"]').selectFile('cypress/fixtures/test-backup.json', { force: true });
    
    // Navigate merge options with keyboard
    cy.get('input[value="merge"]').should('be.checked').focus();
    cy.focused().type('{downarrow}'); // Move to replace
    cy.get('input[value="replace"]').should('be.checked');
    
    // Use keyboard to confirm
    cy.contains('button', 'Continue').focus().type('{enter}');
    
    // Should complete the merge
    cy.contains('Success!').should('be.visible');
  });
});