import api from "./api";

export const getCampaigns = async () => {
  const response = await api.get("/phishing/campaigns");
  return response.data.data;
};

export const createCampaign = async (campaign) => {
  const response = await api.post("/phishing/campaigns", campaign);
  return response.data;
};

export const launchCampaign = async (campaignId) => {
  const response = await api.post(`/phishing/campaigns/${campaignId}/launch`);
  return response.data;
};

export const getCampaignStats = async (campaignId) => {
  const response = await api.get(`/phishing/campaigns/${campaignId}/stats`);
  return response.data.data;
};
