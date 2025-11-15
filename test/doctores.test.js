const request = require('supertest');
const app = require('../src/app');

describe('Doctors API', () => {
  let doctorId;

  // Test GET - list doctors (initially empty)
  test('GET /api/doctores - should return empty array initially', async () => {
    const response = await request(app).get('/api/doctores');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Test POST - create doctor
  test('POST /api/doctores - should create a new doctor', async () => {
    const newDoctor = {
      name: 'Carlos',
      lastName: 'Ramírez',
      specialty: 'Cardiología',
      phone: '0987654321',
      email: 'carlos.ramirez@hospital.com',
      licenseNumber: 'LIC-12345'
    };

    const response = await request(app)
      .post('/api/doctores')
      .send(newDoctor);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Carlos');
    expect(response.body.lastName).toBe('Ramírez');
    expect(response.body.specialty).toBe('Cardiología');
    expect(response.body.licenseNumber).toBe('LIC-12345');

    doctorId = response.body.id;
  });

  // Test POST - required fields validation
  test('POST /api/doctores - should return 400 error if fields are missing', async () => {
    const incompleteDoctor = {
      name: 'Maria',
      lastName: 'Gonzalez'
      // Missing: specialty, phone, email, licenseNumber
    };

    const response = await request(app)
      .post('/api/doctores')
      .send(incompleteDoctor);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  // Test POST - Duplicate license number validation
  test('POST /api/doctores - should return 409 error if license number already exists', async () => {
    const duplicateDoctor = {
      name: 'Pedro',
      lastName: 'Sánchez',
      specialty: 'Pediatría',
      phone: '0998765432',
      email: 'pedro.sanchez@hospital.com',
      licenseNumber: 'LIC-12345' // Same license number
    };

    const response = await request(app)
      .post('/api/doctores')
      .send(duplicateDoctor);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('A doctor with this license number already exists');
  });

  // Test GET - List doctors (after creating one)
  test('GET /api/doctores - should return array with doctors', async () => {
    const response = await request(app).get('/api/doctores');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Test PUT - Update doctor
  test('PUT /api/doctores/:id - should update an existing doctor', async () => {
    const updatedData = {
      specialty: 'Neurocirugía',
      phone: '0912345678'
    };

    const response = await request(app)
      .put(`/api/doctores/${doctorId}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.specialty).toBe('Neurocirugía');
    expect(response.body.phone).toBe('0912345678');
    expect(response.body.name).toBe('Carlos'); // Should not change
  });

  // Test PUT - Doctor not found
  test('PUT /api/doctores/:id - should return 404 if doctor does not exist', async () => {
    const response = await request(app)
      .put('/api/doctores/999999')
      .send({ specialty: 'Dermatología' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Doctor not found');
  });

  // Test DELETE - Delete doctor
  test('DELETE /api/doctores/:id - should delete an existing doctor', async () => {
    const response = await request(app).delete(`/api/doctores/${doctorId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe(doctorId);
  });

  // Test DELETE - Doctor not found
  test('DELETE /api/doctores/:id - should return 404 if doctor does not exist', async () => {
    const response = await request(app).delete('/api/doctores/999999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Doctor not found');
  });

  // Test GET - Verify doctor was deleted
  test('GET /api/doctores - should return empty array after deleting', async () => {
    const response = await request(app).get('/api/doctores');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });
});
