// CRUD OF DOCTORS
// {
//    id
//    name
//    lastName
//    specialty
//    phone
//    email
//    licenseNumber
// }

const doctors = [];

// GET - List all doctors
function getAllDoctors(req, res) {
  res.json(doctors);
}

// POST - Add new doctor
function addNewDoctor(req, res) {
  const { name, lastName, specialty, phone, email, licenseNumber } = req.body;

  // Validate required fields
  if (!name || !lastName || !specialty || !phone || !email || !licenseNumber) {
    return res.status(400).json({ 
      message: 'Name, Last Name, Specialty, Phone, Email and License Number are required' 
    });
  }

  // Validation: Do not allow doctors with the same license number
  if (doctors.some(d => d.licenseNumber === licenseNumber)) {
    return res.status(409).json({ 
      message: 'A doctor with this license number already exists' 
    });
  }

  // Create doctor object
  const newDoctor = {
    id: Date.now(), // Simulated ID
    name,
    lastName,
    specialty,
    phone,
    email,
    licenseNumber
  };

  // Add to array
  doctors.push(newDoctor);

  // Respond with created doctor
  res.status(201).json(newDoctor);
}

// PUT - Update doctor
function updateDoctor(req, res) {
  const { id } = req.params;
  const { name, lastName, specialty, phone, email, licenseNumber } = req.body;

  const i = doctors.findIndex(d => d.id === Number.parseInt(id));
  if (i === -1) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  // If attempting to update license number, verify it doesn't exist in another doctor
  if (licenseNumber && licenseNumber !== doctors[i].licenseNumber) {
    if (doctors.some(d => d.licenseNumber === licenseNumber && d.id !== Number.parseInt(id))) {
      return res.status(409).json({ 
        message: 'A doctor with this license number already exists' 
      });
    }
  }

  // Update fields
  if (name) doctors[i].name = name;
  if (lastName) doctors[i].lastName = lastName;
  if (specialty) doctors[i].specialty = specialty;
  if (phone) doctors[i].phone = phone;
  if (email) doctors[i].email = email;
  if (licenseNumber) doctors[i].licenseNumber = licenseNumber;

  res.json(doctors[i]);
}

// DELETE - Delete doctor
function deleteDoctor(req, res) {
  const { id } = req.params;

  const doctorIndex = doctors.findIndex(d => d.id === Number.parseInt(id));
  if (doctorIndex === -1) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const deleted = doctors.splice(doctorIndex, 1);
  res.json(deleted[0]);
}

module.exports = { getAllDoctors, addNewDoctor, updateDoctor, deleteDoctor };
