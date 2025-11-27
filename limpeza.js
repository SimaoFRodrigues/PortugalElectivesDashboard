const fs = require("fs");

const inputFile = "data/legislativas_raw.json";
const outputFile = "data/legislativas1.json";

// Função para ler o ficheiro JSON
function readJsonFile(filePath) {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

// Função para limpar e reestruturar os dados
function cleanElectionData(rawData) {
  const districtMap = rawData[0];
  const cleanedData = {};

  // Inicializa a estrutura de dados com os nomes dos distritos
  for (const id in districtMap) {
    const districtName = districtMap[id];
    cleanedData[districtName] = { id, data: {}, partidos: {} };
  }

  let currentParty = null;

  // Itera sobre cada linha do ficheiro de dados brutos
  rawData.slice(1).forEach((row) => {
    if (!row || (!row.Círculo && !row.Column2)) return;

    const metricName = row.Círculo || currentParty;
    const subMetricName = row.Column2;

    if (row.Círculo && row.Column2) {
      // Linhas de dados gerais (Inscritos, Votantes, etc.)
      currentParty = null; // Reseta o partido atual
      for (const id in districtMap) {
        const districtName = districtMap[id];
        if (!cleanedData[districtName].data[metricName]) {
          cleanedData[districtName].data[metricName] = {};
        }
        const value = row[id];
        cleanedData[districtName].data[metricName][subMetricName] =
          value === "-" || value === "c.r." ? null : value;
      }
    } else if (row.Círculo && !row.Column2) {
      // Linha que define um novo partido
      currentParty = row.Círculo;
    } else if (currentParty && subMetricName) {
      // Linhas de dados de um partido
      for (const id in districtMap) {
        const districtName = districtMap[id];
        if (!cleanedData[districtName].partidos[currentParty]) {
          cleanedData[districtName].partidos[currentParty] = {};
        }
        const value = row[id];
        cleanedData[districtName].partidos[currentParty][subMetricName] =
          value === "-" || value === "c.r." ? null : value;
      }
    }
  });

  return cleanedData;
}

// Função principal para executar o processo
function main() {
  try {
    const rawData = readJsonFile(inputFile);
    const cleanedData = cleanElectionData(rawData);
    fs.writeFileSync(outputFile, JSON.stringify(cleanedData, null, 2));
    console.log(`Dados limpos e guardados em ${outputFile}`);
  } catch (error) {
    console.error("Ocorreu um erro durante a limpeza dos dados:", error);
  }
}

main();
