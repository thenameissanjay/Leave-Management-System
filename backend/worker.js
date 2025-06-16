const { Worker } = require('bullmq');
const { AppDataSource } = require('./config/connection');
const { employee } = require('./entity/employee');
const { updateLeaveBalanceByEmployee } = require('./service/leavebalanceService');
const logger = require('./logger/logger');
const {connection} = require('./config/redis-queue')

AppDataSource.initialize().then(() => {
  const employeeRepo = AppDataSource.getRepository(employee);
  const worker = new Worker(
    'bulk-upload-queue',
    async (job) => {
      const batch = job.data;

      for (const emp of batch) {
        try {
          const exists = await employeeRepo.findOneBy({ email: emp.email });
          if (exists) {
            logger.warn(`Duplicate email skipped: ${emp.email}`);
            continue;
          }
        
          const newEmp = employeeRepo.create({
            name: emp.name || null,
            email: emp.email || null,
            phone: emp.phone || null,
            designation: emp.designation === '' ? null : emp.designation,
            date_of_joining: emp.date_of_joining === '' ? null : emp.date_of_joining,
            reporting_to: emp.reporting_to === '' ? null : emp.reporting_to,
            password: emp.password  || null,
            deletedAt: emp.deletedAt || null,
          });
          

          const savedEmp = await employeeRepo.save(newEmp);
          await updateLeaveBalanceByEmployee(savedEmp);

          logger.info(`Added employee: ${savedEmp.email}`);
        } catch (err) {
          logger.error(`Error processing employee: ${err.message}`);
        }
      }
    },
    {
      connection,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed: ${err.message}`);
  });
}).catch((err) => {
  console.error('Failed to initialize DB connection for worker:', err);
});
