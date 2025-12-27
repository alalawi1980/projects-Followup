(function(){
  const STORAGE_KEY = "icv_projects_v2";
  function nval(x){ return (typeof x==='number' && isFinite(x))?x:0; }

  let baseData = []; 

  function init() {
      if(typeof getCurrentUser !== 'function') return;
      const user = getCurrentUser();
      let raw = [];
      try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); } catch(e){}

      const selEnt = document.getElementById("sl_entity");

      if(user && user.role !== 'admin') {
          // USER: Filter data
          const myEnt = (user.entity||"").trim();
          baseData = raw.filter(p => (p.entity||"").trim() === myEnt);
          
          selEnt.innerHTML = `<option value="${myEnt}">${myEnt}</option>`;
          selEnt.value = myEnt;
          selEnt.disabled = true;
          selEnt.style.background = "#eee";
      } else {
          // ADMIN
          baseData = raw;
          const ents = [...new Set(baseData.map(p=>(p.entity||"").trim()).filter(x=>x))].sort();
          selEnt.innerHTML = '<option value="">الكل</option>' + ents.map(e=>`<option value="${e}">${e}</option>`).join('');
          selEnt.disabled = false;
      }
      
      updateProjs();
      render();
  }

  window.onEntityChange = function() { updateProjs(); render(); }

  function updateProjs() {
      const ent = document.getElementById("sl_entity").value;
      const selP = document.getElementById("sl_project");
      let list = baseData;
      if(ent) list = baseData.filter(p=>(p.entity||"").trim()===ent);
      
      selP.innerHTML = '<option value="">الكل</option>';
      list.forEach(p=>{ if(p.project_name) selP.innerHTML += `<option value="${p.id}">${p.project_name}</option>`; });
      selP.value = "";
  }

  window.refresh = function() { render(); }

  function render() {
      const fe = document.getElementById("sl_entity").value;
      const fp = document.getElementById("sl_project").value;
      const fq = document.getElementById("sl_quarter").value;

      const list = baseData.filter(p => 
          (!fe || (p.entity||"").trim()===fe) &&
          (!fp || String(p.id)===String(fp)) &&
          (!fq || p.quarter===fq)
      );

      // KPI
      document.getElementById("kpi_projects").innerText = list.length;
      const tc = list.reduce((s,p)=>s+nval(p.total_cost),0);
      const tlc = list.reduce((s,p)=>s+nval(p.total_lc),0);
      document.getElementById("kpi_total_cost").innerText = tc.toLocaleString();
      document.getElementById("kpi_total_lc").innerText = tlc.toLocaleString();
      document.getElementById("kpi_lc_percent").innerText = tc ? ((tlc/tc)*100).toFixed(1)+"%" : "0%";

      // Chart
      const parts = {omanis:0, non_omanis:0, made_oman:0, sup_local:0, import_direct:0, sup_smes:0, prov_local:0, prov_foreign:0, prov_smes:0};
      list.forEach(p=>{ if(p.lc_parts) Object.keys(parts).forEach(k=> parts[k]+=nval(p.lc_parts[k])); });
      
      const ctx = document.getElementById("lcPie");
      if(window.myChart) window.myChart.destroy();
      window.myChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
              labels: Object.keys(parts),
              datasets: [{ data: Object.values(parts), backgroundColor: ["#2ecc71","#e74c3c","#3498db","#9b59b6","#f1c40f","#1abc9c","#34495e","#95a5a6","#d35400"] }]
          }
      });

      // Top 5
      const sorted = [...list].sort((a,b)=>nval(b.lc_percent)-nval(a.lc_percent)).slice(0,5);
      document.getElementById("top5List").innerHTML = sorted.map((p,i)=>`
          <div class="rank"><div>#${i+1}</div><div style="flex:1">${p.project_name}</div><b>${nval(p.lc_percent).toFixed(1)}%</b></div>
      `).join('');
      
      // Top Entities
      const eMap={};
      list.forEach(p=>{
          const e=(p.entity||"NA").trim();
          if(!eMap[e]) eMap[e]={c:0,l:0};
          eMap[e].c+=nval(p.total_cost); eMap[e].l+=nval(p.total_lc);
      });
      const topE = Object.keys(eMap).map(k=>({e:k, p:eMap[k].c?(eMap[k].l/eMap[k].c)*100:0})).sort((a,b)=>b.p-a.p).slice(0,5);
      document.getElementById("top5EntitiesList").innerHTML = topE.map((x,i)=>`
          <div class="rank"><div>🏆${i+1}</div><div style="flex:1">${x.e}</div><b>${x.p.toFixed(1)}%</b></div>
      `).join('');
  }

  window.addEventListener("DOMContentLoaded", ()=> setTimeout(init, 100));
})();
