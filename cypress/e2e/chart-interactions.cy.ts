/// <reference types="cypress" />

describe('Chart Interactions', () => {
  beforeEach(() => {
    // Mock Alpha Vantage API responses
    cy.intercept('GET', '/api/stock/AAPL', { fixture: 'alpha-vantage-mock.json' }).as('getAAPL');
    cy.intercept('GET', '/api/stock/GOOGL', { fixture: 'alpha-vantage-googl.json' }).as('getGOOGL');
    cy.intercept('GET', '/api/stock/TSLA', { fixture: 'alpha-vantage-tsla.json' }).as('getTSLA');
    
    // Visit home page and wait for app to be ready
    cy.visit('/');
    cy.get('[data-testid="app-ready"]', { timeout: 5000 }).should('exist');
  });

  describe('Demo Chart Section', () => {
    it('should display demo chart section with mocked AAPL data', () => {
      // Check demo chart section exists
      cy.get('[data-testid="demo-chart-section"]').should('be.visible');
      cy.contains('Demo: Interactive Stock Chart').should('be.visible');
      cy.contains('Live AAPL data showing our chart component in action').should('be.visible');
      
      // Wait for mocked API call
      cy.wait('@getAAPL');
      
      // Check chart loads with data
      cy.get('[data-testid="stock-chart-AAPL"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-testid="chart-container-AAPL"]').should('be.visible');
      cy.get('[data-testid="chart-metrics-AAPL"]').should('be.visible');
    });

    it('should display chart metrics correctly', () => {
      // Wait for mocked API call and chart to load
      cy.wait('@getAAPL');
      cy.get('[data-testid="stock-chart-AAPL"]', { timeout: 10000 }).should('be.visible');
      
      // Check all metric categories are present
      cy.contains('52W High').should('be.visible');
      cy.contains('52W Low').should('be.visible');
      cy.contains('Avg Volume').should('be.visible');
      cy.contains('Previous Close').should('be.visible');
      
      // Check metric values are displayed with expected mocked data ranges
      cy.get('[data-testid="chart-metrics-AAPL"]').within(() => {
        // Should show price values from our mocked data (around $185-$210 range)
        cy.contains(/\$2\d{2}\.\d{2}/).should('be.visible'); // Price format $2xx.xx
        cy.contains(/\d+\.?\d*[KMB]?/).should('be.visible'); // Volume format (could be 1.2M, 500K, etc.)
      });
    });

    it('should show current price and price change', () => {
      // Wait for mocked API call and chart to load
      cy.wait('@getAAPL');
      cy.get('[data-testid="stock-chart-AAPL"]', { timeout: 5000 }).should('be.visible');
      
      // Check current price is displayed (from our mock: $185.85)
      cy.contains('$185.85').should('be.visible');
      
      // Check for any price change indicators (more flexible)
      cy.get('[data-testid="stock-chart-AAPL"]').within(() => {
        // Look for any negative number (price difference)
        cy.contains(/-/).should('be.visible');
        // Look for percentage format 
        cy.contains('%').should('be.visible');
      });
    });

    it('should handle chart loading states', () => {
      // Reload page to catch loading state (need to setup mocks again)
      cy.intercept('GET', '/api/stock/AAPL', { fixture: 'alpha-vantage-mock.json', delay: 1000 }).as('getAAPLSlow');
      cy.reload();
      cy.get('[data-testid="app-ready"]', { timeout: 10000 }).should('exist');
      
      // Check loading state appears
      cy.get('[data-testid="demo-chart-section"]').within(() => {
        cy.contains('Loading chart data...').should('be.visible');
      });
      
      // Wait for delayed mock response and chart to load
      cy.wait('@getAAPLSlow');
      cy.get('[data-testid="stock-chart-AAPL"]', { timeout: 10000 }).should('be.visible');
      cy.contains('Loading chart data...').should('not.exist');
    });
  });

  describe('Stock Card Chart Expansion', () => {
    it('should add stock to watchlist and show expandable card', () => {
      // Focus and type in the search input
      cy.get('input[placeholder*="Search for stocks"]').should('be.visible').focus().type('AAPL');
      
      // Wait for suggestions and click on AAPL
      cy.contains('Apple Inc.').should('be.visible').click();
      
      // Wait for the stock to be added and the API call to complete
      cy.wait('@getAAPL');
      
      // Check if the stock card appears in the watchlist
      cy.get('[data-testid="stock-card-AAPL"]', { timeout: 5000 }).should('be.visible');
      
      // Check that the watchlist stock card chart is initially not visible (collapsed)
      // We need to scope within the watchlist area, not the demo section
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('not.exist');
      });
      
      // Click to expand the stock card
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      
      // Check that the chart becomes visible within the stock card
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]', { timeout: 5000 }).should('be.visible');
      });
    });

    it('should collapse chart when clicked again', () => {
      // Expand first
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      
      // Collapse again
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-chart-AAPL"]').should('not.exist');
    });

    it('should show chart without metrics in expanded card', () => {
      // Expand the card
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      
      // Chart should be visible but metrics should not be shown (showMetrics=false)
      cy.get('[data-testid="chart-container-AAPL"]').should('be.visible');
      cy.get('[data-testid="chart-metrics-AAPL"]').should('not.exist');
    });

    it('should show data points count in expanded view', () => {
      // Expand the card
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      
      // Check data points information
      cy.contains(/\d+ data points available/).should('be.visible');
    });

    it('should have external link to view details', () => {
      // Expand the card
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      
      // Check View Details button exists
      cy.get('[data-testid="view-details-AAPL"]').should('be.visible');
      cy.get('[data-testid="view-details-AAPL"]').should('contain', 'View Details');
      
      // Verify it has correct target (should open in new tab)
      cy.get('[data-testid="view-details-AAPL"]').should('have.attr', 'onclick');
    });
  });

  describe('Chart Accessibility', () => {
    beforeEach(() => {
      // Wait for mocked demo chart to load
      cy.wait('@getAAPL');
      cy.get('[data-testid="stock-chart-AAPL"]', { timeout: 10000 }).should('be.visible');
    });

    it('should have proper ARIA labels and roles', () => {
      // Check main chart region
      cy.get('[data-testid="stock-chart-AAPL"]')
        .should('have.attr', 'role', 'region')
        .should('have.attr', 'aria-labelledby')
        .should('have.attr', 'aria-describedby');
      
      // Check chart container
      cy.get('[data-testid="chart-container-AAPL"]')
        .should('have.attr', 'role', 'img')
        .should('have.attr', 'tabindex', '0');
      
      // Check metrics section
      cy.get('[data-testid="chart-metrics-AAPL"]')
        .should('have.attr', 'role', 'list')
        .should('have.attr', 'aria-label');
    });

    it('should be keyboard navigable', () => {
      // Focus chart container with Tab
      cy.get('[data-testid="chart-container-AAPL"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'chart-container-AAPL');
      
      // Test keyboard interaction
      cy.focused().type('{enter}');
      // Chart should remain focused and functional
      cy.focused().should('have.attr', 'data-testid', 'chart-container-AAPL');
    });

    it('should have screen reader descriptions', () => {
      // Check for screen reader content
      cy.get('[data-testid="stock-chart-AAPL"]').within(() => {
        cy.get('.sr-only').should('exist');
        cy.get('.sr-only').should('contain', 'Line chart showing');
        cy.get('.sr-only').should('contain', 'AAPL stock price');
      });
    });
  });

  describe('Multiple Stock Charts', () => {
    it('should handle multiple expanded charts', () => {
      // Add multiple stocks
      cy.addStockToWatchList('AAPL');
      cy.waitForStockData('AAPL');
      cy.addStockToWatchList('GOOGL');
      cy.waitForStockData('GOOGL');
      
      // Expand both charts
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      
      cy.get('[data-testid="stock-card-trigger-GOOGL"]').click();
      cy.get('[data-testid="stock-chart-GOOGL"]').should('be.visible');
      
      // Both charts should be visible simultaneously
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      cy.get('[data-testid="stock-chart-GOOGL"]').should('be.visible');
    });

    it('should maintain separate chart states', () => {
      // Add multiple stocks
      cy.addStockToWatchList('AAPL');
      cy.waitForStockData('AAPL');
      cy.addStockToWatchList('TSLA');
      cy.waitForStockData('TSLA');
      
      // Expand first chart
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      
      // Second chart should remain collapsed
      cy.get('[data-testid="stock-chart-TSLA"]').should('not.exist');
      
      // Expand second chart
      cy.get('[data-testid="stock-card-trigger-TSLA"]').click();
      cy.get('[data-testid="stock-chart-TSLA"]').should('be.visible');
      
      // Collapse first chart
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-chart-AAPL"]').should('not.exist');
      
      // Second chart should remain expanded
      cy.get('[data-testid="stock-chart-TSLA"]').should('be.visible');
    });
  });

  describe('Chart Error Handling', () => {
    it('should handle chart with no data gracefully', () => {
      // Mock error response for invalid stock
      cy.intercept('GET', '/api/stock/INVALID', { 
        statusCode: 400, 
        fixture: 'alpha-vantage-error.json' 
      }).as('getINVALID');
      
      // Add a stock that will return error
      cy.addStockToWatchList('INVALID');
      
      // Wait for error response
      cy.wait('@getINVALID');
      
      // Try to expand the card
      cy.get('[data-testid="stock-card-INVALID"]').should('be.visible');
      cy.get('[data-testid="stock-card-trigger-INVALID"]').click();
      
      // Should either show error state or loading state, not crash
      cy.get('[data-testid="stock-card-INVALID"]').within(() => {
        // Should contain either error message or loading state
        cy.get('*').should('satisfy', ($el) => {
          const text = $el.text();
          return text.includes('No chart data available') || 
                 text.includes('Loading') || 
                 text.includes('Error') ||
                 text.includes('Unable to load');
        });
      });
    });
  });

  describe('Chart Performance', () => {
    it('should lazy load charts only when expanded', () => {
      // Add a stock but don't expand
      cy.addStockToWatchList('AAPL');
      cy.waitForStockData('AAPL');
      
      // Chart component should not exist until expanded
      cy.get('[data-testid="stock-chart-AAPL"]').should('not.exist');
      
      // Expand to trigger lazy loading
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      
      // Now chart should exist and load
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
    });

    it('should show loading state during chart rendering', () => {
      // Add stock and immediately try to expand
      cy.addStockToWatchList('GOOGL');
      
      // Try to expand quickly to catch loading state
      cy.get('[data-testid="stock-card-trigger-GOOGL"]').click();
      
      // Should show loading spinner briefly
      cy.get('.animate-spin').should('be.visible');
      
      // Wait for chart to load
      cy.waitForStockData('GOOGL');
      cy.get('[data-testid="stock-chart-GOOGL"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Chart Data Interactions', () => {
    beforeEach(() => {
      // Ensure mocked demo chart is loaded
      cy.wait('@getAAPL');
      cy.get('[data-testid="stock-chart-AAPL"]', { timeout: 10000 }).should('be.visible');
    });

    it('should display trend indicators correctly', () => {
      cy.get('[data-testid="stock-chart-AAPL"]').within(() => {
        // Our mock data shows a downward trend (185.85 < 186.12)
        // Should show red/down trend styling
        cy.get('svg').should('have.class', 'text-red-600');
        
        // Price change should match the downward trend (flexible matching)
        cy.get('span').contains(/-\d+\.\d{2}/).should('be.visible'); // Any negative change
        cy.get('span').contains(/\(\d+\.\d{2}%\)/).should('be.visible'); // Any percentage
      });
    });

    it('should show proper time range formatting', () => {
      cy.get('[data-testid="stock-chart-AAPL"]').within(() => {
        // Chart should show date labels in short format (e.g., "Jan 15")
        cy.get('.recharts-xAxis').should('be.visible');
        // X-axis should contain date-like text (check for month abbreviations)
        cy.get('.recharts-cartesian-axis-tick-value').should('exist').then($els => {
          const text = $els.text();
          expect(text).to.match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
        });
      });
    });

    it('should display price axis formatting', () => {
      cy.get('[data-testid="stock-chart-AAPL"]').within(() => {
        // Y-axis should show dollar formatting
        cy.get('.recharts-yAxis').should('be.visible');
        cy.get('.recharts-cartesian-axis-tick-value').should('contain.text', '$');
      });
    });
  });
});