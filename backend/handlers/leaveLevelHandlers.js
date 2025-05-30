const {AppDataSource} = require('../connection')

const repo = AppDataSource.getRepository("leave_level");

const getLeaveLevel = async (req, res) =>{
  try {
    const result = await repo.find();
    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const createLeaveLevel = async (req, res) => {

  try {
    const leaveLevel = repo.create(req.body); 
    if(!leaveLevel){
      return res.json({message: 'required name and description'})
    }
    await repo.save(leaveLevel);
    res.status(201).json({ status: true, message: 'Successfully added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
}
  
const deleteLeaveLevel = async (req, res) => {
  const id = parseInt(req.params.id);
  if(!id){
    return res.json({message: 'required name and description'})
  }
  try {
    const result = await repo.delete(id);
    if (result.affected === 0) {
      return res.status(404).json({ error: 'Leave level not found' });
    }
    res.json({ success: true, message: 'Leave level deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
}
 
const updateLeaveLevel = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if(!id){
      return res.json({message: 'required name and description'})
    }
    const existing = await repo.findOneBy({ leave_level_id: id });

    if (!existing) {
      return res.status(404).json({ error: 'Leave level not found' });
    }

    repo.merge(existing, req.body);
    await repo.save(existing);

    res.json({ success: true, message: 'Leave Level updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
}
  
const getLeaveLevelOrder = async (req, res) => {
  const { leaveCount, fromDate, toDate } = req.body;

  if(!leaveCount || !fromDate || !toDate){
    return res.json({message: 'required name and description'})
  }
  try {
    const result = await repo
      .createQueryBuilder('leave_level')
      .where('leave_level.start_count <= :leaveCount', { leaveCount })
      .andWhere('leave_level.end_count >= :leaveCount', { leaveCount })
      .andWhere('leave_level.start_date <= :fromDate', { fromDate })
      .andWhere('leave_level.end_date >= :toDate', { toDate })
      .getMany();
    console.log(result)
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
};


module.exports = {getLeaveLevel, createLeaveLevel, deleteLeaveLevel, updateLeaveLevel, getLeaveLevelOrder}