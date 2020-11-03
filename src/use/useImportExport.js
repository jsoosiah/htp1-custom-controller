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

  function filterMacroCommands(patch) {
    return patch.filter(
      cmd => cmd.path.search(/status|videostat|stat|svronly|versions|ipInfo|hostip|bluetooth/) < 0
    );
  }

  function filterCommands(patch) {
    return patch.filter(
      cmd => cmd.path.search(/status|videostat|stat|versions|ipInfo|hostip|bluetooth/) < 0
    );
  }

  return {
    importJson,
    exportJsonToFile,
    importJsonFileToSelected,
    filterCommands,
    filterMacroCommands,
  };
}

function currentDateStr() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const dateLocal = new Date(now.getTime() - offsetMs);
  return dateLocal.toISOString().slice(0, 19).replace(/-|:/g, "").replace("T", "-");
}