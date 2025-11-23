const ficheiro = "data/legislativas_raw.json";

function cleanElectionData(rawData) {
  const cleaned = { Inscritos: {}, Votantes: {} };
  rawData.forEach((row) => {
    const district = row["Círculo"];
    if (district && district !== "Total") {
      cleaned["Inscritos"][district] = parseInt(row["Inscritos"]);
      cleaned["Votantes"][district] = parseInt(row["Votantes"]);
    }
  });
  return cleaned;
}
