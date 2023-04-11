describe('spec.cy.js', () => {
  it('should return 200OK for health status', ()=> {
          cy.request({
              method: 'GET',
              url: 'http://localhost:43256/health',
              headers: {
                  'Content-Type': 'application/json; charset=utf-8',
              },
              body: null
          }).as('details');
      cy.get('@details').its('status').should('eq', 200);
//      cy.get('@details').then((response) => {
//          expect(response.body.category).to.eq('Normal');
//          expect(response.body.systolic).to.eq('119');
//          expect(response.body.diastolic).to.eq('79');
//      });

  })
})
