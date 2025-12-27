(function() {
  const STORAGE_KEY = "icv_projects_v2";
  function v(sel){ return document.querySelector(sel)?.value.trim() || ""; }
  function nval(el){ return parseFloat(el?.value) || 0; }
  function load(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch(e){return [];} }
  function save(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  function getEditId(){ try { return new URL(window.location.href).searchParams.get("edit"); } catch(e){return null;} }

  function collectFullFields(){
    const out={};
    document.querySelectorAll(".form-group").forEach(g=>{
      const lab=g.querySelector("label");
      const ctrl=g.querySelector("input,select,textarea");
      if(!lab || !ctrl) return;
      const key = lab.textContent.trim();
      let val=ctrl.value;
      if(ctrl.type==="number") val = parseFloat(val) || (val===""?"":0);
      out[key]=val;
    });
    return out;
  }

  // Auto-fill entity for user
  window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
          if (typeof getCurrentUser === 'function') {
              const user = getCurrentUser();
              if (user && user.role !== 'admin') {
                  const el = document.querySelector('input[name="entity"]');
                  if(el) {
                      el.value = user.entity;
                      el.setAttribute('readonly', 'readonly');
                      el.style.backgroundColor = '#f0f0f0';
                  }
              }
          }
      }, 100);
  });

  window.saveProject = function(){
    if(!v('[name="entity"]') || !v('[name="project_name"]')){
      alert("الجهة واسم المشروع مطلوبان"); return;
    }
    const editId = getEditId();
    const rec = {
      id: editId ? editId : Date.now(),
      entity: v('[name="entity"]'),
      project_name: v('[name="project_name"]'),
      quarter: v('[name="quarter"]'),
      year: v('[name="year"]'),
      project_status: v('[name="project_status"]'),
      contractor: v('[name="contractor"]'),
      total_cost: nval(document.getElementById("total_cost")),
      total_lc: nval(document.getElementById("total_lc")),
      lc_percent: nval(document.getElementById("pct_lc")),
      lc_parts: {
        omanis: nval(document.getElementById("lc_omanis_08")),
        non_omanis: nval(document.getElementById("lc_non_02")),
        made_oman: nval(document.getElementById("lc_made_oman_07")),
        sup_local: nval(document.getElementById("lc_sup_local_018")),
        import_direct: nval(document.getElementById("lc_import_direct_006")),
        sup_smes: nval(document.getElementById("lc_sup_smes_018")),
        prov_local: nval(document.getElementById("lc_prov_local_07")),
        prov_foreign: nval(document.getElementById("lc_prov_foreign_01")),
        prov_smes: nval(document.getElementById("lc_prov_smes_07"))
      },
      full_fields: collectFullFields()
    };

    const list = load();
    if(editId){
      const idx = list.findIndex(x=>x.id == editId);
      if(idx===-1) list.push(rec); else list[idx] = rec;
      alert("تم التعديل");
    } else {
      list.push(rec);
      alert("تمت الإضافة");
    }
    save(list);
    window.location.href = "projects.html";
  };
})();