/**
 * BANIBS Mobile - Groups Service
 * Phase M5.3 - Mobile Groups Module
 * 
 * API calls for groups (Phase 8.5 backend integration)
 */

import axiosInstance from '../utils/axiosInstance';
import {API_ENDPOINTS} from '../config/api';

export const groupsService = {
  /**
   * Get user's joined groups
   * @param {number} limit - Max groups to fetch
   */
  async getMyGroups(limit = 50) {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.MY_GROUPS}?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch my groups:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to load groups'
      );
    }
  },

  /**
   * Get all groups (with optional filters)
   * @param {Object} filters
   * @param {string} filters.privacy - PUBLIC, PRIVATE, SECRET
   * @param {string} filters.search - Search query
   * @param {number} filters.limit - Max results
   */
  async getAllGroups(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.privacy) params.append('privacy', filters.privacy);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.GROUPS}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to load groups'
      );
    }
  },

  /**
   * Get group details by ID
   * @param {string} groupId
   */
  async getGroupDetail(groupId) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.GROUP_DETAIL(groupId)
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch group detail:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to load group'
      );
    }
  },

  /**
   * Join a group
   * @param {string} groupId
   */
  async joinGroup(groupId) {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.GROUP_JOIN(groupId)
      );
      return response.data;
    } catch (error) {
      console.error('Failed to join group:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to join group'
      );
    }
  },

  /**
   * Leave a group
   * @param {string} groupId
   */
  async leaveGroup(groupId) {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.GROUP_LEAVE(groupId)
      );
      return response.data;
    } catch (error) {
      console.error('Failed to leave group:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to leave group'
      );
    }
  },

  /**
   * Get group members
   * @param {string} groupId
   * @param {Object} filters
   */
  async getGroupMembers(groupId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.GROUP_MEMBERS(groupId)}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch group members:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to load members'
      );
    }
  },
};

export default groupsService;
