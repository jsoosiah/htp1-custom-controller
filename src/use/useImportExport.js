import { ref } from 'vue';

export default function useImportExport() {

  const importJson = ref(null);

  function exportJsonToFile(json, filename){
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${filename}-${currentDateStr()}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function importJsonFileToSelected(file) {
    if (file) {
      const reader = new FileReader();
      reader.readAsText(event.target.files[0]);
      reader.onload = e => {
        try {
          importJson.value = JSON.parse(e.target.result);
        } catch (e) {

        }
      }
    }
  }

  return {
    importJson,
    exportJsonToFile,
    importJsonFileToSelected
  };
}

function currentDateStr() {
  const m = new Date();
  return m.getUTCFullYear() +""+ (m.getUTCMonth()+1) +""+ m.getUTCDate() + "-" 
  + m.getUTCHours() + "" + m.getUTCMinutes() + "" + m.getUTCSeconds();
}