const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('../authentication/authentication-service');
const { User } = require('../../../models');


/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */

async function getUsers(request, response, next) {
  try {
    const users = await usersService.getUsers();
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;
    const Search = await User.findOne({email});

      if(Search) {
        throw errorResponder(
          errorTypes.EMAIL_ALREADY_TAKEN,
        'EMAIL_ALREADY_TOKEN')
      }
    if(password!=password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
      'INVALID_PASSWORD_ERROR'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed tu create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;
    const Search = await User.findOne({email});

    if(Search) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
      'EMAIL_ALREADY_TOKEN')
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}




async function patchUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;
    const old_password = request.body.old_password;
    const old_password_confirm = request.body.old_password_confirm;
    const new_password = request.body.new_password;
    const new_password_confirm = request.body.new_password_confirm;

  if(old_password!=old_password_confirm&&new_password!=new_password_confirm) {
    throw errorResponder(
      errorTypes.INVALID_PASSWORD,
      'INVALID_PASSWORD_ERROR'
    )
  };

  const user = await User.findById(id);
  
  const loginSuccess = await authenticationServices.checkLoginCredentials(
    email, 
    old_password
  );

  if(user.name !== name) {
    throw errorResponder(
      errorTypes.NAME_ENTERED,
      'WRONG_NAME_ERROR'
    )
  }

  if(user.email !== email) {
    throw errorResponder(
      errorTypes.EMAIL_ENTERED,
      'WRONG_EMAIL_ERROR'
    )
  }

  if(!loginSuccess) {
    throw errorResponder(
      errorTypes.INVALID_CREDENTIALS,
      'Wrong email or password'
    )
  }
  const success = await usersService.patchUser(id, new_password)
  if (!success) {
    throw errorResponder(
      errorTypes.EMAIL_ALREADY_TAKEN,
      'Failed to Patch User'
    );
  }

  return response.status(200).json({id, email})
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  patchUser,
};
