import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const syncUser = asyncHandler(async (req, res) => {
  const { auth0Id, email, name, picture } = req.body;

  if (!auth0Id || !email) {
    throw new ApiError(400, 'Auth0 ID and Email are required');
  }

  let user = await User.findOne({ auth0Id });
  let isNewUser = false;

  if (!user) {

    user = await User.create({
      auth0Id,
      email,
      name: name || '',
      picture: picture || '',
      createdCourses: [],
    });
    isNewUser = true;
  } else {
    user.name = name || user.name;
    user.picture = picture || user.picture;
    await user.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { user, isNewUser },
      isNewUser ? 'User registered successfully' : 'User synced successfully'
    )
  );
});


export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('createdCourses');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(200, user, 'Current user profile fetched successfully')
  );
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const { auth0Id } = req.params;

  const user = await User.findOne({ auth0Id }).populate('createdCourses');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(200, user, 'User profile fetched successfully')
  );
});