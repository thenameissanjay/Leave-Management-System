const { AppDataSource } = require('../connection');
const { leave_policy_dm } = require('../entity/leave_policy_dm');

const repo = AppDataSource.getRepository(leave_policy_dm);
const { leave_balance } = require('../entity/leave_balance');
const { employee } = require('../entity/employee');
const {
  updateLeaveBalanceByLeavetype,
} = require('../service/leavebalanceService');
const {
  updateLeaveBalanceByLeavePolicy,
} = require('../service/leavebalanceService');


// GET
// /api/leavepolicyDM/getLeavePolicy 
 
const getLeavePolicy = async (req, res) => {
  try {
    const records = await repo
      .createQueryBuilder('lp')
      .leftJoin('lp.designation', 'designation')
      .leftJoin('lp.leave_type', 'leave_type')
      .select([
        'designation.id AS designation_id',
        'designation.name AS designation',
        'leave_type.id AS leave_type_id',
        'leave_type.name AS type',
        'lp.accrual_leave AS value',
        'lp.max_days_per_year AS max',
      ])
      .getRawMany();

    const grouped = {};

    records.forEach(
      ({ designation_id, designation, leave_type_id, type, value, max }) => {
        if (!grouped[designation_id]) {
          grouped[designation_id] = {
            designation_id,
            designation,
            leaves: [],
          };
        }

        grouped[designation_id].leaves.push({
          leave_type_id,
          type,
          value,
          max,
        });
      }
    );
    /***
 * {
  "34": {
    "designation_id": 34,
    "designation": "Director",
    "leaves": [
      {
        "leave_type_id": 42,
        "type": "Sick",
        "value": 4,
        "max": 15
      },
      {
        "leave_type_id": 43,
        "type": "Casual",
        "value": 4,
        "max": 15
      },
      {
        "leave_type_id": 44,
        "type": "Personal",
        "value": 4,
        "max": 15
      },
 *  */
    const result = Object.values(grouped);
    /** result = 
 * {
    "designation_id": 34,
    "designation": "Director",
    "leaves": [
      {
        "leave_type_id": 42,
        "type": "Sick",
        "value": 4,
        "max": 15
      },
      {
        "leave_type_id": 43,
        "type": "Casual",
        "value": 4,
        "max": 15
      },
 */
    res.json(result);
  } catch (error) {
    console.error('Error fetching leave policies:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// PUT
// /api/leavepolicyDM/updateLeavePolicy
/**req.body = {
 * {
    "designation_id": 21,
    "leaves": [
      {
        "leave_type_id": 33,
        "value": 2,
        "max": 10
      },
      {
        "leave_type_id": 34,
        "value": 2,
        "max": 10

      },
      {
        "leave_type_id": 35,
        "value": 2,
        "max": 10

      }
    ]
  }
  }
 */

const updateLeavePolicy = async (req, res) => {
  const leavePolicyPayloads = req.body;

  try {
    for (const policy of leavePolicyPayloads) {
      const { designation_id, leaves } = policy;

      for (const { leave_type_id, value, max } of leaves) {
        const existing = await repo.findOne({
          where: {
            employee_type_id: designation_id,
            leave_type_id: leave_type_id,
          },
        });

        if (existing) {
          existing.accrual_leave += value;
          existing.max_days_per_year += max;
          await repo.save(existing);
        }
      }
    }

    // add leave count to leave balance entity
    await updateLeaveBalanceByLeavePolicy(leavePolicyPayloads);

    return res.json({
      message: 'Leave policies updated (only existing records).',
    });
  } catch (err) {
    console.error('Error updating leave policies:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getLeavePolicy, updateLeavePolicy };
