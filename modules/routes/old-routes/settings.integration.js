const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');
const Setting = require('../models/setting');

describe('Settings API', function() {
  before(function clearSettings() {
    return Setting.remove({});
  });

  afterEach(function clearSettings() {
    return Setting.remove({});
  });

  describe('GET /settings', function() {
    const testData = {
      name: 'phone number',
      value: '555-5555'
    };

    before(function() {
      return new Setting(testData).save();
    });

    it('should return a list of settings', function() {
      return request(app)
        .get('/settings')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).to.be.instanceOf(Array);
          expect(res.body.length).to.equal(1);
          let actual = res.body[0];
          expect(actual).to.contain(testData);
        });
    });
  });

  describe('GET /settings/:name', function() {
    const testData = {
      name: 'email',
      value: 'foo@example.com'
    };

    before(function() {
      return new Setting(testData).save();
    });

    before(function() {
      return Setting.findOne({ name: 'email' }).then(setting => {
        expect(setting).to.contain(testData);
      });
    });

    it('should return the setting requested', function() {
      return request(app)
        .get('/settings/email')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).to.contain(testData);
        });
    });
  });

  describe('POST /settings', function() {
    it('should return the new setting', function() {
      const newSetting = {
        name: 'email',
        value: 'foo@example.com'
      };
      return request(app)
        .post('/settings')
        .send(newSetting)
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body.name).to.equal('email');
          expect(res.body.value).to.equal('foo@example.com');
          return request(app)
            .get('/settings')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
              expect(res.body).to.be.instanceOf(Array);
              expect(res.body.length).to.equal(1);
              let actual = res.body[0];
              expect(actual).to.contain(newSetting);
            });
        });
    });
  });

  describe('PUT /settings/:name', function() {
    it('should update the setting', function() {
      const testData = {
        name: 'email',
        value: 'foo@example.com'
      };

      before(function() {
        return new Setting(testData).save();
      });

      return request(app)
        .put('/settings/email')
        .send({
          value: 'bar@example.com'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.name).to.equal('email');
          expect(res.body.value).to.equal('bar@example.com');
          return request(app)
            .get('/settings/email')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
              expect(res.body).to.contain({
                name: 'email',
                value: 'bar@example.com'
              });
            });
        });
    });
  });

  describe('DELETE /settings/:name', function() {
    const testData = {
      name: 'email',
      value: 'foo@example.com'
    };

    before(function() {
      return new Setting(testData).save();
    });

    it('should delete the setting', function() {
      return request(app)
        .get('/settings/email')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.name).to.equal('email');
          expect(res.body.value).to.equal('foo@example.com');
          return request(app).delete('/settings/email').expect(204).then(() => {
            return Setting.findOne({ name: 'email' }).then(
              setting => expect(setting).not.to.exist
            );
          });
        });
    });
  });
});
