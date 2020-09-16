import { expect } from 'chai';

describe('Unit test user', () => {

  describe('Controller', () => {
    it('should be 6', (done) => {
      expect(2 + 4).to.equals(6);
      done();
    });
  });

  describe('Service', () => {
    it('should not be 7', (done) => {
      expect(2 + 4).to.not.equals(7);
      done();
    });
  });
});
