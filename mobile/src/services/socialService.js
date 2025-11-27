/**
 * BANIBS Mobile - Social Service
 * Phase M2 - Social Feed
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const socialService = {
  async getFeed(limit = 20, offset = 0) {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/api/social/feed?limit=${limit}&offset=${offset}`,
        {headers},
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to load feed',
      );
    }
  },

  async createPost(text, imageUrl = null) {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${API_URL}/api/social/posts`,
        {
          text,
          image_url: imageUrl,
        },
        {headers},
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to create post',
      );
    }
  },

  async likePost(postId) {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${API_URL}/api/social/posts/${postId}/like`,
        {},
        {headers},
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to like post',
      );
    }
  },

  async unlikePost(postId) {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.delete(
        `${API_URL}/api/social/posts/${postId}/like`,
        {headers},
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to unlike post',
      );
    }
  },

  async getComments(postId) {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/api/social/posts/${postId}/comments`,
        {headers},
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to load comments',
      );
    }
  },

  async createComment(postId, text) {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${API_URL}/api/social/posts/${postId}/comments`,
        {text},
        {headers},
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to create comment',
      );
    }
  },
};

export default socialService;
