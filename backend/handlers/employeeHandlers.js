const {AppDataSource} = require('../connection');
const { leave_request } = require('../entity/leave_requests');
const {convertToCalendarFormat} = require('../function/calendarFunction')
const employeeRepo = AppDataSource.getRepository("employee");
const leaveRepo = AppDataSource.getRepository("leave_policy");
const leaveRequestRepo = AppDataSource.getRepository(leave_request);
const {LeaveStatus, LeaveStatusLabel} = require('../entity/leave_requests');
const getIdNameDesg = async  (req, res) => {
  try {
    const data = await employeeRepo.find({
      select: ['employee_id', 'name', 'designation'],
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
  }

const getIdNameDesgId = async (req, res) => {
    const { id } = req.params;
    if(!id){
      return res.json({message: 'required name and description'})
    }
    try {
      const data = await employeeRepo.find({
        where: { employee_id: id },
        select: ['employee_id', 'name', 'designation'],
      });
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database query failed' });
    }
  }

const getName = async (req, res) => {
  const { id } = req.params;
  if(!id){
    return res.json({message: 'required name and description'})
  }
  try {
    const employee = await employeeRepo.findOne({
      where: { employee_id: id },
      select: ['name'],
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    console.log(employee)

    res.json({ name: employee.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
  }

const getLeave = async (req, res) => {
    const { id } = req.params;
    if(!id){
      return res.json({message: 'required name and description'})
    }
    try {
      const employee = await employeeRepo.findOne({
        where: { employee_id: id },
        select: ['sick', 'casual', 'others'],
      });
  
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
  
      res.json(employee);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }

const getWhereDesg = async (req, res) => {
    const { role } = req.query;
    if(!role){
      return res.json({message: 'required name and description'})
    }

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
  
    try {
      const result = await employeeRepo.find({
        where: { designation: role },
        select: ['employee_id', 'name', 'designation'],
      });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database query failed' });
    }
  };

const getTotalLeave = async (req, res) => {
    const { id } = req.params;
    if(!id){
      return res.json({message: 'required name and description'})
    }
    try {
      const result = await leaveRepo.findOne({
        where: { level: id },
        select: ['total_sick', 'total_casual', 'total_others'],
      });
      console.log(result)
  
      if (!result) {
        return res.status(404).json({ error: 'Leave policy not found' });
      }
  
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
  
const getLeaveLevelOrder = async (req, res) => {
    const { leaveCount, fromDate, toDate } = req.body;
    if(!leaveCount || !fromDate || !toDate){
      return res.json({message: 'required name and description'})
    }
    try {
      const repo = AppDataSource.getRepository("leave_level");

      const result = await repo
        .createQueryBuilder('leave_level')
        .where('leave_level.start_count <= :leaveCount', { leaveCount })
        .andWhere('leave_level.end_count >= :leaveCount', { leaveCount })
        .andWhere('leave_level.start_date <= :fromDate', { fromDate })
        .andWhere('leave_level.end_date >= :toDate', { toDate })
        .getMany();
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Query failed' });
    }
  };

const getCalendar = async (req, res) =>{
   const reporting_to = req.params.id;
   if(!reporting_to){
    return res.json({message: 'required name and description'})
  }

  try {
    const results = await leaveRequestRepo.createQueryBuilder('lr')
    .leftJoinAndSelect('lr.employee', 'e')
    .select([
      'e.employee_id AS employee_id',
      'e.name AS name',
      'lr.reason AS reason',
      'lr.from_date AS from_date',
      'lr.to_date AS to_date',
    ])
    .where('lr.reporting_to = :reporting_to', {reporting_to: reporting_to})
    .andWhere('lr.status = :status', {status: LeaveStatus.approved})
    .getRawMany()
    const calendarJson = convertToCalendarFormat(results)
    console.log(results)
    return res.json(calendarJson)
  } catch (error) {
    return res.json({err: error})
  }
  };


module.exports = {
   getIdNameDesg, 
   getName,
   getWhereDesg,
   getIdNameDesgId,
   getLeave,
   getLeaveLevelOrder,
   getTotalLeave,
   getCalendar
}
  