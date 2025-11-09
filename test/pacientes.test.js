const request = require('supertest');
const app = require('../src/app.js');

describe('Pacientes API', () => {
  // GET
  test('GET /api/pacientes should return an empty list initially', async () => {
    const res = await request(app).get('/api/pacientes');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);  // Vacía al inicio
  });

  // POST
  test('POST /api/pacientes should create a new patient', async () => {
    const newPatient = {
      name: 'Juan',
      lastName: 'Perez',
      email: 'juanperez@example.com',
      gender: 'Masculino',
      illness: 'Gripe'
    };

    const res = await request(app).post('/api/pacientes').send(newPatient);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Juan');
    expect(res.body.lastName).toBe('Perez');
  });

  // POST: No invalid data
  test('POST /api/pacientes should reject invalid data', async () => {
    const res = await request(app).post('/api/pacientes').send({ name: 'Carlos' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Name, Last Name, Email, Gender and Illness are required');
  });

  // PUT
  test('PUT /api/pacientes/:id should update an existing patient', async () => {
    const patient = {
      name: 'Ana',
      lastName: 'Lopez',
      email: 'analopez@example.com',
      gender: 'Femenino',
      illness: 'Fiebre'
    };

    const anaLopez = await request(app).post('/api/pacientes').send(patient);
    const id = anaLopez.body.id;

    const updated = await request(app)
      .put(`/api/pacientes/${id}`)
      .send({ illness: 'Migraña' });

    expect(updated.statusCode).toBe(200);
    expect(updated.body.illness).toBe('Migraña');
  });

  // DELETE
  test('DELETE /api/pacientes/:id should delete a patient', async () => {
    const patient = {
      name: 'Carlos',
      lastName: 'Perez',
      email: 'carlosperez@example.com',
      gender: 'Masculino',
      illness: 'Alergia'
    };

    const carlosPerez = await request(app).post('/api/pacientes').send(patient);
    const id = carlosPerez.body.id;

    const deleted = await request(app).delete(`/api/pacientes/${id}`);
    expect(deleted.statusCode).toBe(200);
    expect(deleted.body.name).toBe('Carlos');

    const res = await request(app).get('/api/pacientes');
    expect(res.body.find(p => p.id === id)).toBeUndefined();
  });
});
