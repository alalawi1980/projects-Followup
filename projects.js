const STORAGE_KEY = "icv_projects_v2";

const HEADERS = [
  "م", "إجراءات", "الجهة", "اسم المشروع", "رقم ونوع المناقصة", "حالة المشروع", "المجال", "الاستشاري", 
  "المقاول / الشركة المنفذة", "قيمة المشروع (ر.ع)", "آخر تحديث (الربع)", "آخر تحديث (السنة)",
  "المستهدف للعمانيين (خطة)", "المحقق للعمانيين (تراكمي)", "المستهدف لغير العمانيين (خطة)", 
  "المحقق لغير العمانيين (تراكمي)", "نسبة المحقق للعمانيين %", "نسبة المحقق لغير العمانيين %", 
  "نسبة التعمين الكلية %", "تكلفة الرواتب للعمانيين", "المحتوى المحلي (رواتب عمانيين ×0.8)", 
  "تكلفة الرواتب لغير العمانيين", "المحتوى المحلي (رواتب وافدين ×0.2)", "تكلفة \"صنع في عمان\"", 
  "المحتوى المحلي (صنع في عمان ×0.7)", "تكلفة مورد محلي", "المحتوى المحلي (مورد محلي ×0.18)", 
  "تكلفة استيراد مباشر", "المحتوى المحلي (استيراد مباشر ×0.06)", "تكلفة مورد SMEs", 
  "المحتوى المحلي (مورد SMEs ×0.18)", "تكلفة المزودين المحليين", "المحتوى المحلي (مزود محلي ×0.7)", 
  "تكلفة المزود الأجنبي", "المحتوى المحلي (مزود أجنبي ×0.1)", "تكلفة المزود SMEs", 
  "المحتوى المحلي (مزود SMEs ×0.7)", "إجمالي التكلفة", "إجمالي المحتوى المحلي", "نسبة المحتوى المحلي %", "الملاحظات"
];

function loadProjects() {
  try { 
      let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (typeof getCurrentUser === 'function') {
          const user = getCurrentUser();
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
  const s = String(status).trim();
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
  if(colName.includes("نسبة المحتوى المحلي %")) return p.lc_percent;
  
  if(colName.includes("×0.8")) return parts.omanis;
  if(colName.includes("×0.2")) return parts.non_omanis;
  if(colName.includes("×0.7") && colName.includes("صنع")) return parts.made_oman;
  if(colName.includes("×0.18") && colName.includes("مورد محلي")) return parts.sup_local;
  if(colName.includes("×0.06")) return parts.import_direct;
  if(colName.includes("×0.18") && colName.includes("SMEs")) return parts.sup_smes;
  if(colName.includes("×0.7") && colName.includes("مزود محلي")) return parts.prov_local;
  if(colName.includes("×0.1")) return parts.prov_foreign;
  if(colName.includes("×0.7") && colName.includes("مزود SMEs")) return parts.prov_smes;

  // المحاولة المباشرة
  if (full[colName] !== undefined) return full[colName];
  // المحاولة بدون (ر.ع) أو %
  const cleanCol = colName.replace(" (ر.ع)", "").replace(" %", "");
  if (full[cleanCol] !== undefined) return full[cleanCol];
  
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
  setTimeout(() => {
      const list = loadProjects();
      const table = $('#projectsTable');
      
      if ($.fn.DataTable.isDataTable('#projectsTable')) {
          $('#projectsTable').DataTable().destroy();
      }
      table.empty();

      // بناء الرأس
      let html = '<thead><tr>';
      HEADERS.forEach(h => html += `<th>${h}</th>`);
      html += '</tr></thead><tbody>';

      // بناء الصفوف
      if (list.length > 0) {
          list.forEach((p, i) => {
            html += '<tr>';
            HEADERS.forEach(col => {
              let val = "";
              if (col === "م") val = i + 1;
              else if (col === "إجراءات") {
                  val = `<div style="display:flex; gap:8px; justify-content:center;">
                    <a href="form.html?edit=${p.id}" class="action-btn edit"><i class="fa-solid fa-pen-to-square"></i></a>
                    <a onclick="deleteProject('${p.id}')" class="action-btn delete"><i class="fa-solid fa-trash-can"></i></a>
                  </div>`;
              }
              else if (col === "حالة المشروع") val = getStatusBadge(getValue(p, col));
              else {
                  let raw = getValue(p, col);
                  val = (typeof raw === 'number') ? raw.toLocaleString('en-US', {maximumFractionDigits:2}) : raw;
                  if(col.includes("%") && typeof raw === 'number') val += "%";
              }
              html += `<td>${val || '-'}</td>`;
            });
            html += '</tr>';
          });
      }
      html += '</tbody>';
      
      table.html(html);

      $('#projectsTable').DataTable({
        dom: 'Bfrtip',
        scrollX: true,
        pageLength: 10,
        destroy: true,
        autoWidth: false,
        buttons: [
          { extend: 'excel', text: '📥 Excel', className: 'btn-sm' },
          { extend: 'print', text: '🖨 طباعة', className: 'btn-sm' }
        ],
        language: { url: '//cdn.datatables.net/plug-ins/1.13.8/i18n/ar.json' }
      });
  }, 250);
});
