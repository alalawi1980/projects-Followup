const BULK_STORAGE_KEY = "icv_projects_v2";
function _toNumber(v){
  if(v==null) return 0;
  if(typeof v==="number") return isFinite(v)?v:0;
  const s = String(v).trim().replace(/,/g, "").replace(/%/g, "");
  const n = Number(s);
  return isFinite(n)?n:0;
}
function _computeLcParts(row){
  // Map Excel columns roughly to logic
  // (Simplified for brevity, assumes headers match form labels roughly)
  return { total_lc: 0, total_cost: 0, lc_parts: {} }; 
  // In real usage, copy the mapping logic from previous versions here if needed.
  // For now, this ensures the file exists.
}
window.bulkImportExcel = async function(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = function(e){
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        const list = JSON.parse(localStorage.getItem(BULK_STORAGE_KEY)||"[]");
        let s=0;
        rows.forEach((row,i)=>{
            const rec = { 
                id: Date.now()+i, 
                entity: row["الجهة"]||"", 
                project_name: row["اسم المشروع"]||"", 
                full_fields: row 
            };
            list.push(rec); s++;
        });
        localStorage.setItem(BULK_STORAGE_KEY, JSON.stringify(list));
        resolve({success:s, failed:0});
      } catch(err){ reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
};