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
  it('should return a task', () => {
    cy.request('GET', 'http://localhost:3000/api/task/1').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('task');
      expect(response.body.task).to.be.an('object');
    });
  });
  it('should create a task', () => {
    const task: { task: Prisma.tasksCreateInput } = {
      task: {
        what: 'Test Task',
        where: 'Test Location',
        priority: 1,
        start: new Date(),
        doneby: new Date(),
        done: new Date(),
      },
    };
    cy.request('POST', 'http://localhost:3000/api/task/', task).then(
      (response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('task');
        expect(response.body.task).to.be.an('object');
      },
    );
  });
  it('should update a task', () => {
    const task: { task: Prisma.tasksUpdateInput } = {
      task: {
        what: 'Test Task',
        where: 'Test Location',
        priority: 1,
        start: new Date(),
        doneby: new Date(),
        done: new Date(),
      },
    };

    cy.request('PUT', 'http://localhost:3000/api/task/1', task).then(
      (response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('task');
        expect(response.body.task).to.be.an('object');
      },
    );
  });
  it('should delete a task', () => {
    cy.request('DELETE', 'http://localhost:3000/api/task/1').then(
      (response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('task');
        expect(response.body.task).to.be.an('object');
      },
    );
  });
  it('should return a 404 for a task that does not exist', () => {
    cy.request({
      url: 'http://localhost:3000/api/task/99999999',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});

export {};
