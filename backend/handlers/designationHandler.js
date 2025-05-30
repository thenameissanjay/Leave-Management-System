const conn = require('../connection');
const {AppDataSource} = require('../connection')
const {designation} = require('../entity/designation')

const designationRepo = AppDataSource.getRepository(designation)

const CreateDesignation = async (req, res)=>{
  try {
    const { name, description } = req.body;

    if(!name || !description){
      return res.json({message: 'required name and description'})
    }

    const newDesignation = designationRepo.create({ name, description });
    await designationRepo.save(newDesignation);

    res.status(201).json({ success: true, message: "Designation created" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create designation", details: err.message });
  }

}

const GetDesignation = async ( req, res)=>{
  try {
    const all = await designationRepo.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch designations" });
  

}
}

const GetDesignationRole = async (req, res)=>{
  
  try {
    const roles = await designationRepo.find({ select: ["name"] });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch roles" });
  }

}

const deleteDesignation =  async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if(!id){
      return res.json({message: 'required name and description'})
    }
    const result = await designationRepo.delete(id);

    if (result.affected === 0) {
      return res.status(404).json({ error: "Designation not found" });
    }

    res.json({ success: true, message: "Designation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete designation", details: err.message });
  }
}

const updateDesignation = async (req,res)=>{
  const id = parseInt(req.params.id);
  
  if(!id){
    return res.json({message: 'required name and description'})
  }
  const { newName, newDescription, oldName } = req.body;

  try {
    // Update designation
    await designationRepo.update(id, {
      name: newName,
      description: newDescription,
    });

    // Update employee.designation where old name was used
    await employeeRepo
      .createQueryBuilder()
      .update()
      .set({ designation: newName })
      .where("designation = :oldName", { oldName })
      .execute();

    res.json({ success: true, message: "Designation updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update designation", details: err.message });
  }
}

module.exports = {CreateDesignation, GetDesignation, deleteDesignation, GetDesignationRole, updateDesignation}