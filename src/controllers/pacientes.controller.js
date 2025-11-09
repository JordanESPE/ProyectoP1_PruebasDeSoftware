// {
//    id
//    nombre
//    apellido
//    email
//    telefono
//    sexo
//    enfermedad
// }
const pacientes = [];

// GET
function getAllPatients(req, res) {
  res.json(pacientes);
}

// POST
function addnewPatient(req, res) {
  const { name, lastName, email, gender, illness } = req.body;

  // Validación básica de entrada
  if (!name || !lastName || !email || !gender || !illness) {
    return res.status(400).json({ message: 'Name, Last Name, Email, Gender and Illness are required' });
  }

  // Creamos un objeto paciente
  const newPatient = {
    id: Date.now(), // ID simulado
    name,
    lastName,
    email,
    gender,
    illness
  };

  // Lo añadimos al arreglo de pacientes
  pacientes.push(newPatient);

  // Respondemos con el paciente creado
  res.status(201).json(newPatient);
}

// PUT
function updatePatient(req, res) {
  const { id } = req.params;
  const { name, lastName, email, gender, illness } = req.body;

  const i = pacientes.findIndex(p => p.id == id);
  if (i === -1) return res.status(404).json({ message: 'Patient not found' });

  // Update all values
  if (name) pacientes[i].name = name;
  if (lastName) pacientes[i].lastName = lastName;
  if (email) pacientes[i].email = email;
  if (gender) pacientes[i].gender = gender;
  if (illness) pacientes[i].illness = illness;

  res.json(pacientes[i]);
}

// DELETE
function deletePatient(req, res) {
  const { id } = req.params;
  
  const patientIndex = pacientes.findIndex(p => p.id == id);
  if (patientIndex === -1) return res.status(404).json({ message: 'Patient not found' });

  const deleted = pacientes.splice(patientIndex, 1);  // Full delete, no recover

  res.json(deleted[0]);
}

module.exports = { getAllPatients, addnewPatient, updatePatient, deletePatient };
