const BULK_STORAGE_KEY = "icv_projects_v2";

// خريطة الترجمة (المفتاح هو الاسم النظيف المتوقع في النظام)
// ملاحظة: المفاتيح هنا هي "الهدف" الذي نريد توحيد البيانات عليه
const SYSTEM_KEYS = {
    // بيانات عامة
    "الجهة": ["الجهة"],
    "اسم المشروع": ["اسم المشروع"],
    "رقم ونوع المناقصة": ["رقم ونوع المناقصة", "رقم/نوع المناقصة", "رقم/نوع  المناقصة"],
    "حالة المشروع": ["حالة المشروع"],
    "المجال": ["المجال"],
    "الاستشاري": ["الاستشاري"],
    "المقاول / الشركة المنفذة": ["المقاول / الشركة المنفذة", "المقاول/الشركة المنفذة"],
    "قيمة المشروع (ر.ع)": ["قيمة المشروع", "قيمة المشروع (ر.ع)"],
    "تاريخ البدء": ["تاريخ البدء"],
    "تاريخ الانتهاء": ["تاريخ الانتهاء"],
    "آخر تحديث (الربع)": ["آخر تحديث (الربع)", "الربع"],
    "آخر تحديث (السنة)": ["آخر تحديث (السنة)", "السنة"],

    // القوى العاملة
    "المستهدف للعمانيين (خطة)": ["إجمالي المستهدف حسب الخطة للعمانيين"],
    "المحقق للعمانيين (تراكمي)": ["المحقق التراكمي خلال الارباع للعمانيين", "المحقق التراكمي خلال الأرباع للعمانيين"],
    "المستهدف لغير العمانيين (خطة)": ["إجمالي المستهدف حسب الخطة لغير العمانيين"],
    "المحقق لغير العمانيين (تراكمي)": ["المحقق التراكمي خلال الارباع لغير العمانيين", "المحقق التراكمي خلال الأرباع لغير العمانيين"],
    "نسبة المحقق للعمانيين %": ["نسبة المحقق للعمانيين"],
    "نسبة المحقق لغير العمانيين %": ["نسبة المحقق لغير العمانيين"],
    "نسبة التعمين الكلية %": ["نسبة التعمين"],

    // التكاليف
    "تكلفة الرواتب للعمانيين": ["تكلفة الرواتب في المشروع للعمانيين"],
    "تكلفة الرواتب لغير العمانيين": ["تكلفة الرواتب في المشروع لغير العمانيين"],
    "تكلفة \"صنع في عمان\"": ["تكلفة صنع في عمان في المشروع"],
    "تكلفة مورد محلي": ["تكلفة مورد محلي في المشروع"],
    "تكلفة استيراد مباشر": ["تكلفة الاستيراد المباشر في المشروع"],
    "تكلفة مورد SMEs": ["تكلفة مورد من SMEs في المشروع"],
    "تكلفة المزودين المحليين": ["تكلفة المزوديين المحليين في المشروع", "تكلفة المزودين المحليين في المشروع"],
    "تكلفة المزود الأجنبي": ["تكلفة المزود الأجنبي في المشروع"],
    "تكلفة المزود SMEs": ["تكلفة المزود من SMEs في المشروع"],

    // النتائج
    "إجمالي التكلفة": ["اجمالي التكلفة في المشروع", "إجمالي التكلفة في المشروع"],
    "إجمالي المحتوى المحلي": ["اجمالي المحتوى المحلي في المشروع", "إجمالي المحتوى المحلي في المشروع"],
    "نسبة المحتوى المحلي %": ["نسبة المحتوى المحلي في المشروع"],
    "الملاحظات": ["الملاحظات"]
};

// دالة مساعدة لتنظيف مفاتيح الإكسل (إزالة المسافات الزائدة وتوحيد النصوص)
function normalizeKey(key) {
    if (!key) return "";
    return key.toString()
              .trim()
              .replace(/\s+/g, ' ') // استبدال المسافات المتعددة بمسافة واحدة
              .replace(/[أإآ]/g, 'ا') // توحيد الألف
              .replace(/ة/g, 'ه'); // توحيد التاء المربوطة (اختياري، لكن مفيد)
}

// دالة العثور على المفتاح المناسب من الخريطة
function findSystemKey(excelKey) {
    const cleanExcelKey = normalizeKey(excelKey);
    
    for (const [sysKey, variations] of Object.entries(SYSTEM_KEYS)) {
        // التحقق من القائمة المحددة
        if (variations.some(v => normalizeKey(v) === cleanExcelKey)) {
            return sysKey;
        }
        // التحقق من التطابق المباشر مع مفتاح النظام
        if (normalizeKey(sysKey) === cleanExcelKey) {
            return sysKey;
        }
    }
    return excelKey; // إذا لم نجد تطابق، نرجع الاسم كما هو
}

function _toNumber(v){
  if(v == null) return 0;
  if(typeof v === "number") return isFinite(v) ? v : 0;
  const s = String(v).trim().replace(/,/g, "").replace(/%/g, "").replace(/-/g, "0");
  const n = Number(s);
  return isFinite(n) ? n : 0;
}

function _computeLcParts(row){
  // الحسابات تعتمد الآن على المفاتيح الموحدة (System Keys)
  const parts = {
      omanis: _toNumber(row["تكلفة الرواتب للعمانيين"]) * 0.8,
      non_omanis: _toNumber(row["تكلفة الرواتب لغير العمانيين"]) * 0.2,
      made_oman: _toNumber(row["تكلفة \"صنع في عمان\""]) * 0.7,
      sup_local: _toNumber(row["تكلفة مورد محلي"]) * 0.18,
      import_direct: _toNumber(row["تكلفة استيراد مباشر"]) * 0.06,
      sup_smes: _toNumber(row["تكلفة مورد SMEs"]) * 0.18,
      prov_local: _toNumber(row["تكلفة المزودين المحليين"]) * 0.7,
      prov_foreign: _toNumber(row["تكلفة المزود الأجنبي"]) * 0.1,
      prov_smes: _toNumber(row["تكلفة المزود SMEs"]) * 0.7
  };
  
  let total_cost = _toNumber(row["إجمالي التكلفة"]);
  if (!total_cost) {
      const costFields = [
          "تكلفة الرواتب للعمانيين", "تكلفة الرواتب لغير العمانيين", 
          "تكلفة \"صنع في عمان\"", "تكلفة مورد محلي", "تكلفة استيراد مباشر", "تكلفة مورد SMEs",
          "تكلفة المزودين المحليين", "تكلفة المزود الأجنبي", "تكلفة المزود SMEs"
      ];
      total_cost = costFields.reduce((acc, key) => acc + _toNumber(row[key]), 0);
  }

  let total_lc = _toNumber(row["إجمالي المحتوى المحلي"]);
  if (!total_lc) {
      total_lc = Object.values(parts).reduce((a,b)=>a+b, 0);
  }

  return { total_lc, total_cost, lc_parts: parts };
}

window.bulkImportExcel = async function(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = function(e){
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // البحث عن صف العناوين
        const rawData = XLSX.utils.sheet_to_json(sheet, {header: 1});
        let headerRowIndex = 0;
        for(let i=0; i<rawData.length; i++) {
            const rowStr = JSON.stringify(rawData[i]);
            if(rowStr.includes("الجهة") && rowStr.includes("اسم المشروع")) {
                headerRowIndex = i;
                break;
            }
        }

        const rows = XLSX.utils.sheet_to_json(sheet, {range: headerRowIndex});
        const list = JSON.parse(localStorage.getItem(BULK_STORAGE_KEY) || "[]");
        let successCount = 0;

        rows.forEach((row, i) => {
            if(!row["الجهة"] && !row["اسم المشروع"]) return;

            // توحيد أسماء الأعمدة باستخدام الدالة الذكية
            const normalizedRow = {};
            Object.keys(row).forEach(excelKey => {
                const sysKey = findSystemKey(excelKey);
                normalizedRow[sysKey] = row[excelKey];
            });

            // الحسابات
            const computed = _computeLcParts(normalizedRow);

            // بناء السجل
            const rec = { 
                id: Date.now() + i + Math.random(),
                entity: normalizedRow["الجهة"] || "", 
                project_name: normalizedRow["اسم المشروع"] || `مشروع ${i+1}`, 
                project_status: normalizedRow["حالة المشروع"],
                quarter: normalizedRow["آخر تحديث (الربع)"],
                year: normalizedRow["آخر تحديث (السنة)"],
                contractor: normalizedRow["المقاول / الشركة المنفذة"],
                
                total_cost: computed.total_cost,
                total_lc: computed.total_lc,
                lc_percent: computed.total_cost ? (computed.total_lc / computed.total_cost) * 100 : 0,
                lc_parts: computed.lc_parts,
                full_fields: normalizedRow 
            };
            list.push(rec); 
            successCount++;
        });

        localStorage.setItem(BULK_STORAGE_KEY, JSON.stringify(list));
        resolve({success: successCount, failed: 0});
      } catch(err){ reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
};
