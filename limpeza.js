const fs = require("fs");

const inputFile = "data/legislativas_raw.json";
const outputFile = "data/legislativas1.json";

// Ler ficheiro JSON
const rawData = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

// Mapa de distritos (primeira linha do ficheiro)
const districtMap = rawData[0];

// Estrutura final
const cleanedData = {};

// Criar base dos distritos
for (const id in districtMap) {
  const nomeDistrito = districtMap[id];
  cleanedData[nomeDistrito] = {
    id,
    data: {},
    partidos: {}
  };
}

let partidoAtual = null;

// Percorrer linhas de dados
rawData.slice(1).forEach(row => {
  if (!row) return;

  const metrica = row.Círculo;
  const subMetrica = row.Column2;

  // Dados gerais (ex: Inscritos, Votantes)
  if (metrica && subMetrica) {
    partidoAtual = null;

    for (const id in districtMap) {
      const distrito = districtMap[id];

      if (!cleanedData[distrito].data[metrica]) {
        cleanedData[distrito].data[metrica] = {};
      }

      const valor = row[id];
      let resultado;
      if (valor === "-" || valor === "c.r.") {
          resultado = null;
      } else {
        resultado = valor;
      }
      cleanedData[distrito].data[metrica][subMetrica] = resultado;
    }
  }

  // Linha com nome do partido
  else if (metrica && !subMetrica) {
    partidoAtual = metrica;
  }

  // Dados do partido
  else if (partidoAtual && subMetrica) {
    for (const id in districtMap) {
      const distrito = districtMap[id];

      if (!cleanedData[distrito].partidos[partidoAtual]) {
        cleanedData[distrito].partidos[partidoAtual] = {};
      }

      const valor = row[id];
      let resultado;
      if (valor === "-" || valor === "c.r.") {
        resultado = null;
      } else {
        resultado = valor;
      }
      cleanedData[distrito].partidos[partidoAtual][subMetrica] = resultado;
    }
  }
});

// Guardar resultado
fs.writeFileSync(outputFile, JSON.stringify(cleanedData, null, 2));
console.log(`Dados limpos e guardados em ${outputFile}`);
