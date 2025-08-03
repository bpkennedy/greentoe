/// <reference types="cypress" />

describe('Chart Interactions', () => {
  beforeEach(() => {
    // Mock Financial Modeling Prep API responses
    cy.intercept('GET', '/api/stock/AAPL', { fixture: 'fmp-aapl.json' }).as('getAAPL');
    cy.intercept('GET', '/api/stock/GOOGL', { fixture: 'fmp-googl.json' }).as('getGOOGL');
    cy.intercept('GET', '/api/stock/TSLA', { fixture: 'fmp-tsla.json' }).as('getTSLA');
    cy.intercept('GET', '/api/stock/INVALID', { statusCode: 400, fixture: 'fmp-error.json' }).as('getINVALID');
    
    // Visit home page and wait for app to be ready
    cy.visit('/');
    cy.get('[data-testid="app-ready"]').should('exist');
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
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      cy.get('[data-testid="chart-container-AAPL"]').should('be.visible');
      cy.get('[data-testid="chart-metrics-AAPL"]').should('be.visible');
    });

    it('should display chart metrics correctly', () => {
      // Wait for mocked API call and chart to load
      cy.wait('@getAAPL');
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      
      // Check all metric categories are present
      cy.contains('52W High').should('be.visible');
      cy.contains('52W Low').should('be.visible');
      cy.contains('Avg Volume').should('be.visible');
      cy.contains('Previous Close').should('be.visible');
      
      // Check metric values are displayed with expected mocked data ranges
      cy.get('[data-testid="chart-metrics-AAPL"]').within(() => {
        // Should show price values from our mocked data (around $183-$188 range)
        cy.contains(/\$1\d{2}\.\d{2}/).should('be.visible'); // Price format $1xx.xx
        cy.contains(/\d+\.?\d*[KMB]?/).should('be.visible'); // Volume format (could be 1.2M, 500K, etc.)
      });
    });

    it('should show current price and price change', () => {
      // Wait for mocked API call and chart to load
      cy.wait('@getAAPL');
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      
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
      cy.intercept('GET', '/api/stock/AAPL', { fixture: 'fmp-aapl.json', delay: 1000 }).as('getAAPLSlow');
      cy.reload();
      cy.get('[data-testid="app-ready"]').should('exist');
      
      // Check loading state appears
      cy.get('[data-testid="demo-chart-section"]').within(() => {
        cy.contains('Loading chart data...').should('be.visible');
      });
      
      // Wait for delayed mock response and chart to load
      cy.wait('@getAAPLSlow');
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      cy.contains('Loading chart data...').should('not.exist');
    });
  });

  describe('Stock Card Chart Expansion', () => {
    beforeEach(() => {
      // Load test data with AAPL already in watchlist
      cy.loadUserData('test-backup.json'); // Contains AAPL, GOOGL, MSFT
      cy.waitForStockData('AAPL');
    });

    it('should add stock to watchlist and show expandable card', () => {
      // Stock is already added by beforeEach, just verify it's there
      cy.get('[data-testid="stock-card-AAPL"]').should('be.visible');
      
      // Check that the watchlist stock card chart is initially not visible (collapsed)
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('not.exist');
      });
      
      // Click to expand the stock card
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      
      // Check that the chart becomes visible within the stock card
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      });
    });

    it('should collapse chart when clicked again', () => {
      // Expand first
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      });
      
      // Collapse again
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('not.exist');
      });
    });

    it('should show chart without metrics in expanded card', () => {
      // Expand the card
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      
      // Scope within the stock card to avoid demo chart interference
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
        
        // Chart should be visible but metrics should not be shown (showMetrics=false)
        cy.get('[data-testid="chart-container-AAPL"]').should('be.visible');
        cy.get('[data-testid="chart-metrics-AAPL"]').should('not.exist');
      });
    });

    it('should show data points count in expanded view', () => {
      // Expand the card
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      
      // Scope within the stock card
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
        
        // Check data points information (from StockCard line 246)
        cy.contains(/\d+ data points available/).should('be.visible');
      });
    });

    it('should have external link to view details', () => {
      // Expand the card
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      
      // Scope within the stock card
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
        
        // Check View Details button exists
        cy.get('[data-testid="view-details-AAPL"]').should('be.visible');
        cy.get('[data-testid="view-details-AAPL"]').should('contain', 'View Details');
      });
    });
  });

  describe('Chart Accessibility', () => {
    beforeEach(() => {
      // Wait for mocked demo chart to load
      cy.wait('@getAAPL');
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
    });

    it('should have proper ARIA labels and roles', () => {
      // Check main chart region has role
      cy.get('[data-testid="stock-chart-AAPL"]').should('have.attr', 'role', 'region');
      
      // Check chart container has role
      cy.get('[data-testid="chart-container-AAPL"]').should('have.attr', 'role', 'img');
      
      // Check metrics section has role
      cy.get('[data-testid="chart-metrics-AAPL"]').should('have.attr', 'role', 'list');
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
      // Load test data with multiple stocks already in watchlist
      cy.loadUserData('test-backup.json'); // Contains AAPL, GOOGL, MSFT
      cy.waitForStockData('AAPL');
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
      // Load test data and add TSLA manually (AAPL already loaded)
      cy.loadUserData('test-backup.json'); // Contains AAPL, GOOGL, MSFT
      cy.waitForStockData('AAPL');
      // Add TSLA using UI interaction instead of testAddStock
      cy.get('input[placeholder="Search for stocks and ETFs to add..."]').type('TSLA');
      cy.contains('button', 'TSLA').click();
      cy.waitForStockData('TSLA');
      
      // Expand first chart
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      });
      
      // Second chart should remain collapsed (scoped to its card)
      cy.get('[data-testid="stock-card-TSLA"]').within(() => {
        cy.get('[data-testid="stock-chart-TSLA"]').should('not.exist');
      });
      
      // Expand second chart
      cy.get('[data-testid="stock-card-trigger-TSLA"]').click();
      cy.get('[data-testid="stock-card-TSLA"]').within(() => {
        cy.get('[data-testid="stock-chart-TSLA"]').should('be.visible');
      });
      
      // Collapse first chart
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('not.exist');
      });
      
      // Second chart should remain expanded
      cy.get('[data-testid="stock-card-TSLA"]').within(() => {
        cy.get('[data-testid="stock-chart-TSLA"]').should('be.visible');
      });
    });
  });

  describe('Chart Error Handling', () => {
    it('should handle chart with no data gracefully', () => {
      // Mock error response for NFLX (which exists in suggestions)
      cy.intercept('GET', '/api/stock/NFLX', { 
        statusCode: 500, 
        fixture: 'alpha-vantage-error.json' 
      }).as('getNFLXError');
      
      // Add NFLX using UI interaction which will return error
      cy.get('input[placeholder="Search for stocks and ETFs to add..."]').type('NFLX');
      cy.contains('button', 'NFLX').click();
      
      // Wait for error response
      cy.wait('@getNFLXError');
      
      // Check that error state is displayed properly
      cy.get('[data-testid="stock-card-NFLX"]').should('be.visible');
      
      // Should show error content (StockCardError component)
      cy.get('[data-testid="stock-card-NFLX"]').within(() => {
        // Should show error message or retry button
        cy.get('*').should('satisfy', ($el) => {
          const text = $el.text();
          return text.includes('Error') || 
                 text.includes('Failed') || 
                 text.includes('Retry') ||
                 text.includes('Unable') ||
                 text.includes('Invalid');
        });
      });
    });
  });

  describe('Chart Performance', () => {
    it('should lazy load charts only when expanded', () => {
      // Load test data with AAPL already in watchlist but don't expand
      cy.loadUserData('test-backup.json'); // Contains AAPL, GOOGL, MSFT
      cy.waitForStockData('AAPL');
      
      // Within the watchlist stock card, chart component should not exist until expanded
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('not.exist');
      });
      
      // Expand to trigger lazy loading
      cy.get('[data-testid="stock-card-trigger-AAPL"]').click();
      
      // Now chart should exist and load within the stock card
      cy.get('[data-testid="stock-card-AAPL"]').within(() => {
        cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
      });
    });

    it('should show loading state during chart rendering', () => {
      // Load test data with GOOGL already in watchlist and immediately try to expand
      cy.loadUserData('test-backup.json'); // Contains AAPL, GOOGL, MSFT
      
      // Try to expand quickly to catch loading state
      cy.get('[data-testid="stock-card-trigger-GOOGL"]').click();
      
      // Should show loading spinner briefly
      cy.get('.animate-spin').should('be.visible');
      
      // Wait for chart to load
      cy.waitForStockData('GOOGL');
      cy.get('[data-testid="stock-chart-GOOGL"]').should('be.visible');
    });
  });

  describe('Chart Data Interactions', () => {
    beforeEach(() => {
      // Ensure mocked demo chart is loaded
      cy.wait('@getAAPL');
      cy.get('[data-testid="stock-chart-AAPL"]').should('be.visible');
    });

    it('should display trend indicators correctly', () => {
      cy.get('[data-testid="stock-chart-AAPL"]').within(() => {
        // Our mock data shows a downward trend (185.85 < 186.12)
        // Should show red/down trend styling  
        cy.get('svg').should('have.class', 'text-red-600');
        
        // Look for any negative price change (more flexible)
        cy.contains('-').should('be.visible');
        // Look for any percentage symbol
        cy.contains('%').should('be.visible'); 
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