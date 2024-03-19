import { ref } from 'vue';

export default function useImportExport() {

  const importJson = ref(null);
  const validationWarnings = ref([]);
  const maxPeqBands = 16;

  function exportTextToFile(text, contentType, filename, fileExtension) {
    const dataStr = `data:${contentType};charset=utf-8,${text}`
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${filename}-${currentDateStr()}.${fileExtension}`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function exportJsonToFile(json, filename){
    exportTextToFile(encodeURIComponent(JSON.stringify(json, null, 2)), 'text/json', filename, 'json');
  }

  function exportTargetToFile(targetData, filename) {
    const text = 'NAME\n'
                  + 'Unnamed\n'
                  + 'DEVICENAME\n'
                  + 'HTP-1\n'
                  + 'BREAKPOINTS\n'
                  + targetData.filter(elt => elt.x > 10).map(elt => `${elt.x} ${elt.y}`).join('\n')
                  + '\nLOWLIMITHZ\n'
                  + '10\n'
                  + 'HIGHLIMITHZ\n'
                  + '24000\n';
    exportTextToFile(text, 'text/plain', filename, 'txt');
  }

  function parseFile(text) {
    try {
      // parse as JSON
      return JSON.parse(text);
    } catch(e) {
      // attempt to parse as REW EQ
      console.log('attempt to parse as REW EQ format', text);
      // validationWarnings.value = [];
      const warnings = [];
      try {
        const filterTypes = {'PK': 0, 'LS': 1, 'HS': 2};
        const filters = text.split(/\r?\n/).filter(line => line.startsWith('Filter') && line.includes(':'));
        const jsonResult = [];
        for (const filterLine of filters) {
          const filterArray = filterLine.split(/\s+/);
          console.log(filterArray);
          if (filterArray[2] === 'ON') {
            if (filterArray.length > 3 && filterArray[3] === 'None') {
              // silent skip None filters
            }
            else if (filterArray.length !== 12 || !Object.prototype.hasOwnProperty.call(filterTypes,filterArray[3])) {
              warnings.push('Skipping unsupported filter type: ' + filterLine);
            } else if (jsonResult.length === 16) {
              warnings.push(`${maxPeqBands} band limit exceeded; skipping filter: ${filterLine}`);
            } else {
              jsonResult.push({
                channels: {
                  dummy: { // channel name doesn't matter
                    Fc: parseFloat(filterArray[5]),
                    gaindB: parseFloat(filterArray[8]),
                    Q: parseFloat(filterArray[11]),
                    FilterType: filterTypes[filterArray[3]],
                  }
                }
              });
            }
          }
        }

        // fill remaining PEQ slots with default 
        while (jsonResult.length < maxPeqBands) {
          jsonResult.push({
            channels: {
              dummy: {
                Fc: 100,
                gaindB: 0,
                Q: 1,
                FilterType: 0,
              }
            }
          });
        }

        console.log(jsonResult, warnings);
        validationWarnings.value = warnings;
        return jsonResult;

      } catch (e) {
        return {};
      }
    }
  }

  function importJsonFileToSelected(file) {
    if (file) {
      const reader = new FileReader();
      reader.readAsText(event.target.files[0]);
      reader.onload = e => {
        importJson.value = parseFile(e.target.result);
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
    validationWarnings,
    exportTargetToFile,
    exportTextToFile
  };
}

function currentDateStr() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const dateLocal = new Date(now.getTime() - offsetMs);
  return dateLocal.toISOString().slice(0, 19).replace(/-|:/g, "").replace("T", "-");
}