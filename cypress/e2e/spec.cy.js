describe('spec.cy.js', () => {

   const postReading = (email, systolic, diastolic, category) =>{
     return cy.request({
           method: 'POST',
           url: 'http://localhost:43256/addRecords',
           headers: {
               'Content-Type': 'application/json; charset=utf-8',
           },
           body: {
               email: email,
               systolic:  systolic,
               diastolic:  diastolic,
               category: category
           }
       });
   }

    const getReading = (email) =>{
       return  cy.request({
            method: 'POST',
            url: 'http://localhost:43256/getRecords',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: { email: email }
        });
    }

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

  })

    it('should successfully return return history', ()=> {
        let email = `${Date.now()}@aharotest.com`;
        postReading(email, 122, 98, 'High').then(fn => console.log(fn));
        postReading(email, 112, 98, 'High').then(fn => console.log(fn));
        postReading(email, 121, 82, 'Normal').then(fn => console.log(fn));
        getReading(email).then( (rec, e) =>  rec.body).its('length').should('eq', 3);

        email = `${Date.now()}@aharotest.com`;
        postReading(email, 112, 98, 'High').then(fn => console.log(fn));
        postReading(email, 121, 82, 'Normal').then(fn => console.log(fn));
        getReading(email).then( (rec, e) =>  rec.body).its('length').should('eq', 2);
    });
})
