const request = require('supertest');
const app = require('../src/app.js');

describe('Medicamentos API', () => {
  // GET
  test('GET /api/medicamentos should return an empty list initially', async () => {
    const res = await request(app).get('/api/medicamentos');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);  // Vacía al inicio
  });

  // POST
  test('POST /api/medicamentos should create a new medicamento', async () => {
    const newMedicamento = {
      name: 'Paracetamol',
      description: 'Analgésico y antipirético',
      price: 5.50,
      quantity: 100,
      category: 'Analgésicos',
      laboratory: 'Bayer'
    };

    const res = await request(app).post('/api/medicamentos').send(newMedicamento);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Paracetamol');
    expect(res.body.description).toBe('Analgésico y antipirético');
  });

  // POST: No invalid data
  test('POST /api/medicamentos should reject invalid data', async () => {
    const res = await request(app).post('/api/medicamentos').send({ name: 'Ibuprofeno' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Name, Description, Price, Quantity, Category and Laboratory are required');
  });

  // PUT
  test('PUT /api/medicamentos/:id should update an existing medicamento', async () => {
    const medicamento = {
      name: 'Aspirina',
      description: 'Antiinflamatorio',
      price: 3.50,
      quantity: 50,
      category: 'Antiinflamatorios',
      laboratory: 'Bayer'
    };

    const aspirina = await request(app).post('/api/medicamentos').send(medicamento);
    const id = aspirina.body.id;

    const updated = await request(app)
      .put(`/api/medicamentos/${id}`)
      .send({ price: 4.00 });

    expect(updated.statusCode).toBe(200);
    expect(updated.body.price).toBe(4.00);
  });

  // PUT: Actualizar múltiples campos
  test('PUT /api/medicamentos/:id should update multiple fields', async () => {
    const medicamento = {
      name: 'Ibuprofeno',
      description: 'Antiinflamatorio',
      price: 6.00,
      quantity: 80,
      category: 'Antiinflamatorios',
      laboratory: 'Pfizer'
    };

    const ibuprofeno = await request(app).post('/api/medicamentos').send(medicamento);
    const id = ibuprofeno.body.id;

    const updated = await request(app)
      .put(`/api/medicamentos/${id}`)
      .send({ 
        name: 'Ibuprofeno 400mg',
        description: 'Antiinflamatorio y analgésico',
        quantity: 100
      });

    expect(updated.statusCode).toBe(200);
    expect(updated.body.name).toBe('Ibuprofeno 400mg');
    expect(updated.body.description).toBe('Antiinflamatorio y analgésico');
    expect(updated.body.quantity).toBe(100);
    expect(updated.body.price).toBe(6.00); // No cambia
  });

  // DELETE
  test('DELETE /api/medicamentos/:id should delete a medicamento', async () => {
    const medicamento = {
      name: 'Amoxicilina',
      description: 'Antibiótico',
      price: 8.50,
      quantity: 30,
      category: 'Antibióticos',
      laboratory: 'Pfizer'
    };

    const amoxicilina = await request(app).post('/api/medicamentos').send(medicamento);
    const id = amoxicilina.body.id;

    const deleted = await request(app).delete(`/api/medicamentos/${id}`);
    expect(deleted.statusCode).toBe(200);
    expect(deleted.body.name).toBe('Amoxicilina');

    const res = await request(app).get('/api/medicamentos');
    expect(res.body.find(m => m.id === id)).toBeUndefined();
  });

  // PUT: Medicamento no encontrado
  test('PUT /api/medicamentos/:id should return 404 if medicamento not found', async () => {
    const res = await request(app)
      .put('/api/medicamentos/999999')
      .send({ price: 10.00 });
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Medicamento not found');
  });

  // DELETE: Medicamento no encontrado
  test('DELETE /api/medicamentos/:id should return 404 if medicamento not found', async () => {
    const res = await request(app).delete('/api/medicamentos/999999');
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Medicamento not found');
  });

  // Prueba que el manejador 404 funcione
  test('GET /ruta-inexistente - should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/ruta-inexistente');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Route not found');
  });
});
