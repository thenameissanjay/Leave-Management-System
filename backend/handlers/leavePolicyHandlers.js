const { getRepository } = require("typeorm");
const {AppDataSource} = require('../connection')

const repo = AppDataSource.getRepository("leave_policy");

const getLeave = async (req, res) => {
  try { 
    const policies = await repo
      .createQueryBuilder("policy")
      .orderBy("CAST(SUBSTRING(policy.level, 2) AS UNSIGNED)", "ASC")
      .getMany();

    res.json(policies);
  } catch (error) {
    console.error("Error fetching leave policies:", error);
    res.status(500).json({ error: "Database error" });
  }
}

const createLeave = async (req, res) => {
  try {
    if(!req.body.level || !req.body.sick || !req.body.casual|| !req.body.others){
      return res.json({message: 'required name and description'})
    }
    const policy = repo.create({
      level: req.body.level,
      total_sick: req.body.sick,
      total_casual: req.body.casual,
      total_others: req.body.others,
    });

    await repo.save(policy);

    res.status(201).json({
      success: true,
      message: "Leave Policy created",
    });
  } catch (err) {
    console.error("Error creating leave policy:", err);
    res.status(500).json({ error: "Failed to create leave policy" });
  }
}

const updateLeave =  async (req, res) => {
 
  try {
    const { level, total_sick, total_casual, total_others } = req.body;
    if(!level || !total_sick || !total_casual|| !total_others){
      return res.json({message: 'required name and description'})
    }

    const policy = await repo.findOne({ where: { level } });

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    policy.total_sick = total_sick;
    policy.total_casual = total_casual;
    policy.total_others = total_others;

    await repo.save(policy);

    res.json({
      success: true,
      message: "Leave Policy updated successfully",
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to update leave policy" });
  }
}

const deleteLeave = async (req, res) => {
  try {
    const level = req.params.id;
    if(!level){
      return res.json({message: 'required name and description'})
    }

    const policy = await repo.findOne({ where: { level } });

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    await repo.remove(policy);

    res.json({
      success: true,
      message: "Leave Policy deleted successfully",
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to delete leave policy" });
  }
}

module.exports = {
    getLeave, createLeave, updateLeave, deleteLeave
}
