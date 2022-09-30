/// <reference types="Cypress" />
import { Prisma } from '@prisma/client';

context('Testing /api/task/index.ts', () => {
  it('should return a list of tasks', () => {
    cy.request('GET', 'http://localhost:3000/api/task/').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('tasks');
      expect(response.body.tasks).to.be.an('array');
    });
  });
});

export {};
