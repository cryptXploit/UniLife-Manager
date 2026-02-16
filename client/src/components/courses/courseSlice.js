import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { coursesAPI } from '../../services/api';

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async () => {
    const response = await coursesAPI.getCourses();
    return response.data.courses;
  }
);

export const addCourse = createAsyncThunk(
  'courses/addCourse',
  async (courseData) => {
    const response = await coursesAPI.addCourse(courseData);
    return response.data.course;
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, courseData }) => {
    const response = await coursesAPI.updateCourse(id, courseData);
    return response.data.course;
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (id) => {
    await coursesAPI.deleteCourse(id);
    return id;
  }
);

export const fetchTodayCourses = createAsyncThunk(
  'courses/fetchTodayCourses',
  async () => {
    const response = await coursesAPI.getTodayCourses();
    return response.data;
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    todayCourses: [],
    today: '',
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add course
      .addCase(addCourse.fulfilled, (state, action) => {
        state.courses.unshift(action.payload);
      })
      
      // Update course
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex(course => course._id === action.payload._id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
      })
      
      // Delete course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter(course => course._id !== action.payload);
      })
      
      // Today's courses
      .addCase(fetchTodayCourses.fulfilled, (state, action) => {
        state.todayCourses = action.payload.courses;
        state.today = action.payload.today;
      });
  }
});

export const { clearError } = courseSlice.actions;
export default courseSlice.reducer;