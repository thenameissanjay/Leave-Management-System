const {AppDataSource} = require('../connection');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { getLeave } = require('./leavePolicyHandlers');

const repo = AppDataSource.getRepository(leave_policy_dm);

// /api/leavepolicyDM/getLeavePolicy  GET
const getLeavePolicy = async (req, res) => {
    try { 
        const records = await repo
        .createQueryBuilder("lp")
        .leftJoin("lp.designation", "designation")
        .leftJoin("lp.leave_type", "leave_type")
        .select([
          "designation.name AS designation",
          "leave_type.name AS leave_type",
          "lp.max_days_per_year AS days",
          "designation.id AS designation_id",
          "leave_type.id AS leave_type_id"
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
    
      records.forEach(({ designation, leave_type, days,designation_id, leave_type_id }) => {
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