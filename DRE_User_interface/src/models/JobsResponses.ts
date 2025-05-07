export type JobTable = {
  jobKey: string,
  datetimeStr: string,
  energySource: string,
  plan: string,
  progress: string,
  parameters: string,
  downloadUrl: string
}


export type JobDataResponse = {
  jobs: jobs[]
};


export type jobs = { 
  jobKey: string,
  datetimeStr: string,
  energySource: string,
  plan: string,
  progress: string,
  parameters: string,
  downloadUrl: string
}
