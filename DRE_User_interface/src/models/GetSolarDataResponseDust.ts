export type BaseRecord = {
  date: string; 
};

export type solarDustAOT = BaseRecord & {
  withaot: number;
  withsmallaot: number;
  withmediumaot: number;
  withhighaot: number;
};

export type solarDustPercentage = BaseRecord & {
  withaot: number;
  withsmallaot: number;
  withmediumaot: number;
  withhighaot: number;
};

export type solarDustTable =  {
  timestamp: string;
  aot: number;
  ghi: number;
  ghicorrected: number;
  procuctioncorrected: number;
  production: number;
  reduction: number;
};
 
export type GetSolarDataResponseDust = {
  solardustaot: solarDustAOT[];
  solardustpercentage: solarDustPercentage[];
  solardusttablesmall: solarDustTable[];
  solardusttablemedium: solarDustTable[];
  solardusttablehigh: solarDustTable[];
};


 

const createZeroFilledEntry = (timestamp: string, index: number): solarDustTable => {
 
  const timestampDated = new Date(timestamp);
  timestampDated.setHours(timestampDated.getHours() + index); // Increment hour by index
  
 return {
  timestamp: timestampDated.toISOString(),
  aot: 0,
  ghi: 0,
  ghicorrected: 0,
  procuctioncorrected: 0,
  production: 0,
  reduction: 0,
}
};


export const getEmptyDataTable = (startDate: string, numberOfEntries: number): solarDustTable[] => {
  return Array.from({ length: numberOfEntries }, (_, index) =>
    createZeroFilledEntry(startDate, index)
  );
};



const createZeroFilledSolarDustPercentage = (startDate: string, index: number): solarDustPercentage => {
  // Parse the startDate and increment the hour based on the index
  const date = new Date(startDate);
  date.setHours(date.getHours() + index); // Increment hour by index

  return {
    date: date.toISOString(), // Convert back to ISO string format
    withaot: 0,
    withsmallaot: 0,
    withmediumaot: 0,
    withhighaot: 0,
  };
};

// Function to generate an array of zero-filled solarDustPercentage entries
export const getZeroFilledSolarDustPercentage = (startDate: string, numberOfEntries: number): solarDustPercentage[] => {
  return Array.from({ length: numberOfEntries }, (_, index) =>
    createZeroFilledSolarDustPercentage(startDate, index)
  );
};



const roundToDecimal = (num: number, points:number): number => parseFloat(num.toFixed(points));

export const formatSolarDustDataArray = (dataArray: solarDustTable[], points:number): solarDustTable[] => {
  return dataArray.map(data => ({
    timestamp: data.timestamp,
    aot: roundToDecimal(data.aot,points),
    ghi: roundToDecimal(data.ghi,points),
    ghicorrected: roundToDecimal(data.ghicorrected,points),
    procuctioncorrected: roundToDecimal(data.procuctioncorrected,points),
    production: roundToDecimal(data.production,points),
    reduction: roundToDecimal(data.reduction,points),
  }));}
  
  
  
  
  const roundNumbersInObject = <T extends Record<string, any>>(obj: T, decimalPlaces: number): T => {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => 
        [key, typeof value === "number" ? parseFloat(value.toFixed(decimalPlaces)) : value]
      )
    ) as T;
  };
  
  export const formatTableArray = <T extends Record<string, any>>(dataArray: T[], decimalPlaces: number): T[] => {
    return dataArray.map(item => roundNumbersInObject(item, decimalPlaces));
  };