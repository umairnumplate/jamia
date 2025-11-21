import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  // Convert json data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  // Trigger download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
            reject("No data found");
            return;
        }
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};