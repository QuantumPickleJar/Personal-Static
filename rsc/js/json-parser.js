

function parseDates(datesField) {
    if (typeof datesField === 'string' && datesField.trim() !== '') {
      // Assume format "MM-DD-YYYY to MM-DD-YYYY"
      const parts = datesField.split('to').map(s => s.trim());
      return {
        "date-started": parts[0] || "",
        "last-modified": parts[1] || "",
        "date-concluded": ""
      };
    } else if (typeof datesField === 'object') {
      // Already in new format; ensure each key is set (or default to empty string)
      return {
        "date-started": datesField["date-started"] || "",
        "last-modified": datesField["last-modified"] || "",
        "date-concluded": datesField["date-concluded"] || ""
      };
    }
    return { "date-started": "", "last-modified": "", "date-concluded": "" };
  }

  
  function getSortDate(project) {
    const { "date-started": started, "last-modified": modified, "date-concluded": concluded } = project.dates;
    // Priority: concluded > last-modified > date-started
    return concluded || modified || started;
  }
  
export { parseDates, getSortDate };