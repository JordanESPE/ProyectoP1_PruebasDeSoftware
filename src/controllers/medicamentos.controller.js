// {
//    id
//    nombre
//    descripcion
//    precio
//    cantidad
//    categoria
//    laboratorio
// }
const medicamentos = [];

// GET
function getAllMedicamentos(req, res) {
  res.json(medicamentos);
}

// POST
function addNewMedicamento(req, res) {
  const { name, description, price, quantity, category, laboratory } = req.body;

  // Validación básica de entrada
  if (!name || !description || !price || !quantity || !category || !laboratory) {
    return res.status(400).json({ message: 'Name, Description, Price, Quantity, Category and Laboratory are required' });
  }

  // Creamos un objeto medicamento
  const newMedicamento = {
    id: Date.now(), // ID simulado
    name,
    description,
    price,
    quantity,
    category,
    laboratory
  };

  // Lo añadimos al arreglo de medicamentos
  medicamentos.push(newMedicamento);

  // Respondemos con el medicamento creado
  res.status(201).json(newMedicamento);
}

// PUT
function updateMedicamento(req, res) {
  const { id } = req.params;
  const { name, description, price, quantity, category, laboratory } = req.body;

  const i = medicamentos.findIndex(m => m.id === Number.parseInt(id));
  if (i === -1) return res.status(404).json({ message: 'Medicamento not found' });

  // Update all values
  if (name) medicamentos[i].name = name;
  if (description) medicamentos[i].description = description;
  if (price) medicamentos[i].price = price;
  if (quantity) medicamentos[i].quantity = quantity;
  if (category) medicamentos[i].category = category;
  if (laboratory) medicamentos[i].laboratory = laboratory;

  res.json(medicamentos[i]);
}

// DELETE
function deleteMedicamento(req, res) {
  const { id } = req.params;
  
  const medicamentoIndex = medicamentos.findIndex(m => m.id === Number.parseInt(id));
  if (medicamentoIndex === -1) return res.status(404).json({ message: 'Medicamento not found' });

  const deleted = medicamentos.splice(medicamentoIndex, 1);  // Full delete, no recover

  res.json(deleted[0]);
}

module.exports = { getAllMedicamentos, addNewMedicamento, updateMedicamento, deleteMedicamento };
