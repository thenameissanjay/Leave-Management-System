 function convertToCalendarFormat(leaves) {
    const calendar = {};
  
    leaves.forEach(({ name, from_date, to_date }) => {
      let current = new Date(from_date);
      const end = new Date(to_date);
  
      while (current <= end) {
        const dateStr = current.toISOString().slice(0, 10); 
        if (!calendar[dateStr]) calendar[dateStr] = [];
        calendar[dateStr].push(name);
  
        current.setDate(current.getDate() + 1);
      }
    });
  
    // Convert the calendar object to array format
    return Object.entries(calendar).map(([date, absent]) => ({ date, absent }));
  }
  module.exports = {convertToCalendarFormat}


  

  