import { defineStore } from 'pinia';
import http from '@/services/http';
import { useAuthStore } from '@/store/auth';

export const usePlaylistsStore = defineStore('playlists', {
  state: () => ({
    playlists: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getUserPlaylists: (state) => state.playlists,
  },

  actions: {
    async fetchUserPlaylists() {
      const authStore = useAuthStore();
      if (!authStore.user?.id) return;

      this.isLoading = true;
      this.error = null;
      try {
        const response = await http.get('/playlists', {
          params: { user_id: authStore.user.id }
        });
        if (response.data.success) {
          this.playlists = response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch playlists');
        }
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching playlists:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async createPlaylist({ name, description = '', isPublic = false }) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) return;

      this.isLoading = true;
      this.error = null;
      try {
        const response = await http.post('/playlists', {
          user_id: authStore.user.id,
          name,
          description,
          is_public: isPublic
        });
        
        if (response.data.success) {
          this.playlists.push(response.data.data);
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to create playlist');
        }
      } catch (error) {
        this.error = error.message;
        console.error('Error creating playlist:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async addCourseToPlaylist(playlistId, courseId, position = null) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) return;

      this.isLoading = true;
      this.error = null;
      try {
        const response = await http.post(`/playlists/${playlistId}/courses`, {
          user_id: authStore.user.id,
          course_id: courseId,
          position
        });
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to add course to playlist');
        }
        
        // Update course count in the local state
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist) {
          playlist.course_count++;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error('Error adding course to playlist:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
}); 