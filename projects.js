const STORAGE_KEY = "icv_projects_v2";

const HEADERS = [
   "م", "إجراءات", "الجهة", "اسم المشروع", "رقم ونوع المناقصة", "حالة المشروع", "المجال", "الاستشاري", "المقاول / الشركة المنفذة", "قيمة المشروع", "تاريخ البدء", "تاريخ الانتهاء", "آخر تحديث (الربع)", "آخر تحديث (السنة)", "خطة المحتوى المحلي", "إجمالي عدد التقارير المستهدفة", "التقارير المستحقة حتى تاريخه", "التقارير المستلمة", "إجمالي المستهدف حسب الخطة للعمانيين", "المحقق التراكمي خلال الأرباع للعمانيين", "نسبة المحقق للعمانيين", "إجمالي المستهدف حسب الخطة لغير العمانيين", "المحقق التراكمي خلال الأرباع لغير العمانيين", "نسبة المحقق لغير العمانيين", "نسبة التعمين", "تكلفة الرواتب في الخطة للعمانيين", "تكلفة الرواتب في المشروع للعمانيين", "المحتوى المحلي للعمانيين*0.8", "تكلفة الرواتب في الخطة لغير العمانيين", "تكلفة الرواتب في المشروع لغير العمانيين", "المحتوى المحلي لغير العمانيين*0.2", "الفئة الأولى (عماني)", "الفئة الأولى (غير عماني)", "الفئة الثانية (عماني)", "الفئة الثانية (غير عماني)", "الفئة الثالثة (عماني)", "الفئة الثالثة (غير عماني)", "تكلفة صنع في عمان في الخطة", "تكلفة صنع في عمان في المشروع", "تكلفة صنع في عمان من القائمة الإلزامية في المشروع", "المحتوى المحلي لصنع في عمان *0.7", "تكلفة مورد محلي في الخطة", "تكلفة مورد محلي في المشروع", "المحتوى المحلي للمورد المحلي*0.18", "تكلفة الاستيراد المباشر في الخطة", "تكلفة الاستيراد المباشر في المشروع", "المحتوى المحلي للإستيراد المباشر*0.06", "تكلفة مورد من SMEs في الخطة", "تكلفة مورد من SMEs في المشروع", "المحتوى المحلي للمورد من SMEs (*0.18)", "تكلفة المزود المحلي في الخطة", "تكلفة المزوديين المحليين في المشروع", "المحتوى المحلي للمزوديين المحليين *0.7", "تكلفة المزود الأجنبي في الخطة", "تكلفة المزود الأجنبي في المشروع", "المحتوى المحلي للمزود الأجنبي *0.1", "تكلفة المزود من SMEs في الخطة", "تكلفة المزود من SMEs في المشروع", "تكلفة مزود من SMEs من القائمة الإلزامية في المشروع", "المحتوى المحلي للمزود من SMEs (*0.7)", "اجمالي التكلفة في المشروع", "اجمالي المحتوى المحلي في المشروع", "نسبة المحتوى المحلي في المشروع", "الملاحظات"

];

function loadProjects() {
  try { 
      let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      // التأكد من وجود دالة الصلاحيات قبل استخدامها
      if (typeof getCurrentUser === 'function') {
          const user = getCurrentUser();
          // إذا كان مستخدماً عادياً (ليس Admin)، فلتر البيانات
          if (user && user.role !== 'admin') {
              const myEnt = (user.entity || "").trim();
              return data.filter(p => (p.entity || "").trim() === myEnt);
          }
      }
      return data;
  } catch(e) { return []; }
}

function getStatusBadge(status) {
  if (!status) return '<span class="badge info">غير محدد</span>';
  const s = status.trim();
  if (s.includes('منجز') || s.includes('مكتمل')) return `<span class="badge success">${s}</span>`;
  if (s.includes('جاري') || s.includes('تنفيذ')) return `<span class="badge warning">${s}</span>`;
  if (s.includes('متأخر')) return `<span class="badge danger">${s}</span>`;
  return `<span class="badge info">${s}</span>`;
}

function getValue(p, colName) {
  const full = p.full_fields || {};
  const parts = p.lc_parts || {};
  
  if(colName.includes("إجمالي التكلفة")) return p.total_cost;
  if(colName.includes("إجمالي المحتوى المحلي")) return p.total_lc;
  if(colName.includes("نسبة المحتوى المحلي")) return p.lc_percent;
  
  if(colName.includes("×0.8")) return parts.omanis;
  if(colName.includes("×0.2")) return parts.non_omanis;
  if(colName.includes("×0.7") && colName.includes("صنع")) return parts.made_oman;
  if(colName.includes("×0.18") && colName.includes("مورد محلي")) return parts.sup_local;
  if(colName.includes("×0.06")) return parts.import_direct;
  if(colName.includes("×0.18") && colName.includes("SMEs")) return parts.sup_smes;
  if(colName.includes("×0.7") && colName.includes("مزود محلي")) return parts.prov_local;
  if(colName.includes("×0.1")) return parts.prov_foreign;
  if(colName.includes("×0.7") && colName.includes("مزود SMEs")) return parts.prov_smes;

  if (full[colName] !== undefined) return full[colName];
  if (p[colName] !== undefined) return p[colName];
  return ""; 
}

window.deleteProject = function(id) {
  if(confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
    let all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    all = all.filter(p => p.id != id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    location.reload();
  }
};

$(document).ready(function() {
  // زيادة وقت الانتظار قليلاً لضمان تحميل auth.js
  setTimeout(() => {
      const list = loadProjects();
      const table = $('#projectsTable');
      
      // 1. تدمير الجدول السابق إذا وجد (لمنع التكرار)
      if ($.fn.DataTable.isDataTable('#projectsTable')) {
          $('#projectsTable').DataTable().destroy();
      }
      
      table.empty(); // مسح المحتوى القديم بالكامل

      // 2. بناء الهيكل من جديد (الحل لمشكلة الاختفاء)
      // نقوم بإنشاء thead و tbody يدوياً وإضافتها للجدول
      let theadHtml = '<thead><tr>';
      HEADERS.forEach(h => theadHtml += `<th>${h}</th>`);
      theadHtml += '</tr></thead>';
      table.append(theadHtml);

      let tbodyHtml = '<tbody>';
      if (list.length > 0) {
          list.forEach((p, i) => {
            tbodyHtml += '<tr>';
            HEADERS.forEach(col => {
              let val = "";
              if (col === "م") val = i + 1;
              else if (col === "إجراءات") {
                  val = `<div style="display:flex; gap:8px; justify-content:center;">
                    <a href="form.html?edit=${p.id}" style="color:#2980b9; font-size:1.3rem; cursor:pointer;" title="تعديل"><i class="fa-solid fa-pen-to-square"></i></a>
                    <a onclick="deleteProject('${p.id}')" style="color:#c0392b; font-size:1.3rem; cursor:pointer;" title="حذف"><i class="fa-solid fa-trash-can"></i></a>
                  </div>`;
              }
              else if (col === "حالة المشروع") val = getStatusBadge(getValue(p, col));
              else {
                  let raw = getValue(p, col);
                  val = (typeof raw === 'number') ? raw.toLocaleString('en-US', {maximumFractionDigits:2}) : raw;
                  if(col.includes("%") && typeof raw === 'number') val += "%";
              }
              tbodyHtml += `<td>${val || '-'}</td>`;
            });
            tbodyHtml += '</tr>';
          });
      }
      tbodyHtml += '</tbody>';
      table.append(tbodyHtml);

      // 3. تفعيل المكتبة الآن بعد ضمان وجود الهيكل
      $('#projectsTable').DataTable({
        dom: 'Bfrtip',
        scrollX: true,
        pageLength: 10,
        autoWidth: false, // تحسين العرض
        buttons: [
          { extend: 'excel', text: '📥 تصدير Excel', className: 'btn-sm' },
          { extend: 'print', text: '🖨 طباعة', className: 'btn-sm' }
        ],
        language: { url: '//cdn.datatables.net/plug-ins/1.13.8/i18n/ar.json' }
      });
  }, 250);
});