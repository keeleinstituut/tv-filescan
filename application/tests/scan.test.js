const request = require('supertest');
const { makeServer } = require('../src/server');
const config = require('../src/config');
const { PassThrough } = require('stream');

const cleanFile01 = './tests/sample-files/1Mfile01.rnd';
const cleanFile02 = './tests/sample-files/1Mfile02.rnd';
const cleanFile03 = './tests/sample-files/1Mfile03.rnd';
const cleanFile04 = './tests/sample-files/1Mfile04.rnd';
const bigFile = './tests/sample-files/3Mfile.rnd';
const infectedFile = './tests/sample-files/eicar_com.zip';

const NodeClam = require('clamscan');
const { rejectErrorMessage } = require('./__mocks__/clamscan');
jest.mock('clamscan');

describe('Test "scan" API endpoint', () => {
  let srv;
  beforeEach(async () => {
    const server = await makeServer(config);
    srv = server.listen(3000);
  });

  afterEach((done) => {
    srv.close(done);
  });

  it('should return 400 on scan without file', async () => {
    const res = await request(srv).post('/api/v1/scan');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
  });

  it('should return 400 on wrong form key', async () => {
    const res = await request(srv).post('/api/v1/scan').attach(`__${process.env.APP_FORM_KEY}`, cleanFile01);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
  });

  it('should return 400 on more than one form key', async () => {
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`__${process.env.APP_FORM_KEY}`, cleanFile01)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile02);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
  });

  it('should return 413 on scan too big file', async () => {
    const res = await request(srv).post('/api/v1/scan').attach(`${process.env.APP_FORM_KEY}`, bigFile);
    expect(res.statusCode).toEqual(413);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
  });

  it('should return 400 on upload too much files', async () => {
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile01)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile02)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile03)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile04);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
  });

  it('should return 500 on clamd error', async () => {
    const mockedStream = new PassThrough();
    NodeClam.__setMockedStream(mockedStream);
    setTimeout(() => mockedStream.emit('error', new Error(rejectErrorMessage)), 100);
    const res = await request(srv).post('/api/v1/scan').attach(`${process.env.APP_FORM_KEY}`, cleanFile01);
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
  });

  it('should return 500 on clamd timeout', async () => {
    const mockedStream = new PassThrough();
    NodeClam.__setMockedStream(mockedStream);
    setTimeout(() => mockedStream.emit('timeout', new Error(rejectErrorMessage)), 100);
    const res = await request(srv).post('/api/v1/scan').attach(`${process.env.APP_FORM_KEY}`, cleanFile01);
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
  });

  it('should report is_infected=false on scan one clean file', async () => {
    const mockedStream = new PassThrough();
    NodeClam.__setMockedStream(mockedStream);
    setTimeout(() => mockedStream.emit('scan-complete', { isInfected: false, viruses: [] }), 100);
    const res = await request(srv).post('/api/v1/scan').attach(`${process.env.APP_FORM_KEY}`, cleanFile01);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(Array.isArray(res.body.data.result)).toBe(true);
    expect(Array.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(res.body.data.result[0].viruses.length).toBe(0);
    expect(res.body.data.result[0].is_infected).toBe(false);
  });

  it('should report is_infected=false on scan two clean files', async () => {
    const mockedStream = new PassThrough();
    NodeClam.__setMockedStream(mockedStream);
    setTimeout(() => {
      mockedStream.emit('scan-complete', { isInfected: false, viruses: [] });
      mockedStream.resume();
    }, 100);

    setTimeout(() => {
      mockedStream.emit('scan-complete', { isInfected: false, viruses: [] });
    }, 150);

    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile01)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile02);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(Array.isArray(res.body.data.result)).toBe(true);
    expect(Array.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(res.body.data.result[0].viruses.length).toBe(0);
    expect(Array.isArray(res.body.data.result[1].viruses)).toBe(true);
    expect(res.body.data.result[1].viruses.length).toBe(0);
    expect(res.body.data.result[0].is_infected).toBe(false);
    expect(res.body.data.result[1].is_infected).toBe(false);
  });

  it('should report is_infected=true on scan one infected file', async () => {
    const mockedStream = new PassThrough();
    NodeClam.__setMockedStream(mockedStream);
    setTimeout(() => mockedStream.emit('scan-complete', { isInfected: true, viruses: ['bad_virus'] }), 100);
    const res = await request(srv).post('/api/v1/scan').attach(`${process.env.APP_FORM_KEY}`, infectedFile);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(Array.isArray(res.body.data.result)).toBe(true);
    expect(Array.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(res.body.data.result[0].viruses.length).toBe(1);
    expect(res.body.data.result[0].is_infected).toBe(true);
  });

  it('should report is_infected=true and is_infected=false on scan infected and clean file', async () => {
    const mockedStream = new PassThrough();
    NodeClam.__setMockedStream(mockedStream);
    setTimeout(() => {
      mockedStream.emit('scan-complete', { isInfected: true, viruses: ['bad_virus'] });
      mockedStream.resume();
    }, 100);

    setTimeout(() => {
      mockedStream.emit('scan-complete', { isInfected: false, viruses: [] });
    }, 150);

    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`${process.env.APP_FORM_KEY}`, infectedFile)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile01);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(Array.isArray(res.body.data.result)).toBe(true);
    expect(Array.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(res.body.data.result[0].viruses.length).toBe(1);
    expect(Array.isArray(res.body.data.result[1].viruses)).toBe(true);
    expect(res.body.data.result[1].viruses.length).toBe(0);
    expect(res.body.data.result[0].is_infected).toBe(true);
    expect(res.body.data.result[1].is_infected).toBe(false);
  });
});
