(function() {
  const STORAGE_KEY = "icv_projects_v2";
  function load(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch(e){return [];} }
  function getEditId(){ try{return new URL(window.location.href).searchParams.get("edit");}catch(e){return null;} }
  
  window.addEventListener("DOMContentLoaded", () => {
    const id = getEditId();
    if (!id) return;
    const list = load();
    const rec = list.find(x => x.id == id);
    if (!rec) return;

    // Prefill main fields
    ['entity','project_name','contractor','project_status','quarter','year','sector','consultant','tender_no_type'].forEach(f=>{
        const el = document.querySelector(`[name="${f}"]`);
        if(el) el.value = rec[f] || "";
    });

    // Prefill by label text
    if (rec.full_fields) {
        document.querySelectorAll(".form-group").forEach(g => {
            const lab = g.querySelector("label");
            const ctrl = g.querySelector("input, select, textarea");
            if(lab && ctrl) {
                const key = lab.textContent.trim();
                if(rec.full_fields[key] !== undefined) ctrl.value = rec.full_fields[key];
            }
        });
    }
    setTimeout(calc, 100);
  });
})();