const {AppDataSource} = require('../connection');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { getLeave } = require('./leavePolicyHandlers');

const repo = AppDataSource.getRepository(leave_policy_dm);


const getLeavePolicy = async (req, res) => {
    try { 
        const records = await repo
        .createQueryBuilder("lp")
        .leftJoin("lp.designation", "designation")
        .leftJoin("lp.leave_type", "leave_type")
        .select([
          "designation.name AS designation",
          "leave_type.name AS leave_type",
          "lp.max_days_per_year AS days"
        ])
        .getRawMany();
    
      // Sample structure:
      // [
      //   { designation: 'Developer', leave_type: 'Casual', days: 6 },
      //   { designation: 'Developer', leave_type: 'Sick Leave', days: 8 },
      //   ...
      // ]
    
      // Build pivot object
      const pivot = {};
      const leaveTypes = new Set();
    
      records.forEach(({ designation, leave_type, days }) => {
        if (!pivot[designation]) pivot[designation] = { designation };
        pivot[designation][leave_type] = days;
        leaveTypes.add(leave_type);
      });
    
      // Convert object to array
      const result = Object.values(pivot);
    
      res.json(result);
    } catch (error) {
      console.error("Error fetching leave policies:", error);
      res.status(500).json({ error: "Database error" });
    }
  }

  module.exports = {getLeavePolicy}