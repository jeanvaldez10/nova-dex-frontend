import axios from "@/libraries/axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TWITTER_FETCHER_URL ||
  "https://media.nova.trade/api";

//   ------------------------------------------------------------------

export interface TSMediaAttachment {
  url: string;
}

export interface TSAccount {
  id: string;
  username: string;
  display_name: string;
  verified: boolean;
  avatar: string;
}

export interface TSPost {
  id: string;
  created_at: string;
  content: string;
  account: TSAccount;
  media_attachments: TSMediaAttachment[];
}
//   ------------------------------------------------------------------

export const fetchTruthSocialPosts = async (url: string): Promise<TSPost> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fetch-truthsocial`, {
      params: { url },
    });
    return response.data;
  } catch (error) {
    console.warn("Error fetching Truth Social posts:", error);
    throw error;
  }
};

// ------------------------------------------------------------------
export interface TiktokPost {
  posting_account: {
    id: string;
    username: string;
  };
  video_url?: string;
  image_urls?:string[]
}

export const fetchTiktokPosts = async (url: string): Promise<TiktokPost> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fetch-tiktok`, {
      params: { url },
    });
    return response.data;
  } catch (error) {
    console.warn("Error fetching TikTok posts:", error);
    throw error;
  }
};
