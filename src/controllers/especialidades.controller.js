// CRUD DE ESPECIALIDADES

const especialidades = [];

// GET listar
function getAllSpecialties(req, res) {
  res.json(especialidades);
}

// POST agregar
function addnewSpecialty(req, res) {
  const { name } = req.body;

  // Validación de entrada
  if (!name) {
    return res.status(400).json({ message: 'Specialty name is required' });
  }

  // Validación especialidad duplicada
  if (especialidades.some(e => e.name.toLowerCase() === name.toLowerCase())) {
    return res.status(409).json({ message: 'Specialty already exists' });
  }

  // objeto especialidad
  const newSpecialty = {
    id: Date.now(), // ID simulado 
    name
  };

  // añadimos al arreglo
  especialidades.push(newSpecialty);

  // respondemos con especialidad creada
  res.status(201).json(newSpecialty);
}

// PUT actualizar
function updateSpecialty(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  const i = especialidades.findIndex(e => e.id === Number.parseInt(id));
  if (i === -1) {
    return res.status(404).json({ message: 'Specialty not found' });
  }

  if (!name) {
    return res.status(400).json({ message: 'Name is required to update Specialty' });
  }

  especialidades[i].name = name;
  res.json(especialidades[i]);
}

// DELETE eliminar
function deleteSpecialty(req, res) {
  const { id } = req.params;

  const specialtyIndex = especialidades.findIndex(e => e.id === Number.parseInt(id));
  if (specialtyIndex === -1) {
    return res.status(404).json({ message: 'Specialty not found' });
  }

  const deleted = especialidades.splice(specialtyIndex, 1);
  res.json(deleted[0]);
}

module.exports = { getAllSpecialties, addnewSpecialty, updateSpecialty, deleteSpecialty };