function n(id){return parseFloat(document.getElementById(id)?.value)||0;}
function s(id,v){const el=document.getElementById(id); if(el) el.value=isFinite(v)?v.toFixed(2):0;}
function calc(){
  s("pct_omanis", n("tar_omanis")? (n("ach_omanis")/n("tar_omanis"))*100 : 0);
  s("pct_non", n("tar_non")? (n("ach_non")/n("tar_non"))*100 : 0);
  const tAch = n("ach_omanis")+n("ach_non");
  s("pct_omanization", tAch? (n("ach_omanis")/tAch)*100 : 0);

  const l1=n("sal_omanis_project")*0.8; s("lc_omanis_08",l1);
  const l2=n("sal_non_project")*0.2; s("lc_non_02",l2);
  const l3=n("made_oman_project")*0.7; s("lc_made_oman_07",l3);
  const l4=n("sup_local_project")*0.18; s("lc_sup_local_018",l4);
  const l5=n("import_direct_project")*0.06; s("lc_import_direct_006",l5);
  const l6=n("sup_smes_project")*0.18; s("lc_sup_smes_018",l6);
  const l7=n("prov_local_project")*0.7; s("lc_prov_local_07",l7);
  const l8=n("prov_foreign_project")*0.1; s("lc_prov_foreign_01",l8);
  const l9=n("prov_smes_project")*0.7; s("lc_prov_smes_07",l9);

  const cost = n("sal_omanis_project")+n("sal_non_project")+n("made_oman_project")+n("sup_local_project")+
               n("import_direct_project")+n("sup_smes_project")+n("prov_local_project")+n("prov_foreign_project")+n("prov_smes_project");
  s("total_cost", cost);
  
  const lc = l1+l2+l3+l4+l5+l6+l7+l8+l9;
  s("total_lc", lc);
  s("pct_lc", cost? (lc/cost)*100 : 0);
}